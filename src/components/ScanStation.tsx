import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { FamilyProduct, ScanLog } from '../types';
import { 
  QrCode, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Square, 
  Camera, 
  Volume2, 
  VolumeX, 
  Cpu, 
  ChevronRight, 
  Plus, 
  Package, 
  ShieldCheck, 
  Trash2 
} from 'lucide-react';

interface ScanStationProps {
  products: FamilyProduct[];
  onAddLog: (log: ScanLog) => void;
  onUpdateProductQuantity: (barcode: string, change: number, mode: 'set' | 'add') => void;
  onRegisterNewProduct: (product: FamilyProduct) => void;
}

export default function ScanStation({ 
  products, 
  onAddLog, 
  onUpdateProductQuantity,
  onRegisterNewProduct 
}: ScanStationProps) {
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scan input fields
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanMode, setScanMode] = useState<'VERIFY' | 'CHECK_IN' | 'CHECK_OUT' | 'DECOMMISSION'>('CHECK_IN');

  // Scanning simulation states
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanStatus, setScanStatus] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'NOT_FOUND' | 'ERROR';
    message: string;
    product?: FamilyProduct;
    scannedBarcode?: string;
  }>({ status: 'IDLE', message: '' });

  // Real Webcam scanner states and refs
  const [scannerType, setScannerType] = useState<'webcam' | 'simulation'>('webcam');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isWebcamLoading, setIsWebcamLoading] = useState(false);
  const [webcamError, setWebcamError] = useState<string>('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  // Camera canvas simulation ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Keyboard Buffer for real hardware USB barcode scanners
  const keyBuffer = useRef<string>('');
  const lastKeyTime = useRef<number>(0);

  // Query webcam devices on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      Html5Qrcode.getCameras()
        .then((devices) => {
          setCameras(devices);
          if (devices.length > 0) {
            setSelectedCameraId(devices[0].id);
          }
        })
        .catch((err) => {
          console.warn("Failed to retrieve webcam device enumeration:", err);
        });
    }
  }, []);

  // Ensure webcam is cleanly turned off on component unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(err => console.error("Webcam release error:", err));
        }
      }
    };
  }, []);

  // Automatically restart webcam scanning if device source changes while active
  useEffect(() => {
    if (isWebcamActive && selectedCameraId) {
      const restart = async () => {
        await stopWebcam();
        await startWebcam();
      };
      restart();
    }
  }, [selectedCameraId]);

  const startWebcam = async () => {
    try {
      setWebcamError('');
      setIsWebcamLoading(true);
      
      const containerId = "webcam-scanner-viewport";
      // Let React render first if needed
      await new Promise(resolve => setTimeout(resolve, 50));
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error("Video element container not found in layout.");
      }

      if (!html5QrCodeRef.current) {
        // Explicitly enable standard 1D barcode formats and 2D formats for lightning-fast parsing
        html5QrCodeRef.current = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.ITF
          ],
          verbose: false
        });
      }

      const qrCodeSuccessCallback = (decodedText: string) => {
        const now = Date.now();
        if (now - lastScanTimeRef.current < 2500) {
          return; // Throttling scans to avoid continuous double reads
        }
        lastScanTimeRef.current = now;
        executeBarcodeScan(decodedText);
      };

      const config = {
        fps: 24, // High frame rate (24 FPS) to make scan feedback snappy and instantaneous
        qrbox: (width: number, height: number) => {
          // A wider horizontal rectangle box is optimized for 1D barcodes and medicine UPC codes
          const boxWidth = Math.floor(width * 0.85);
          const boxHeight = Math.max(Math.floor(height * 0.45), 110);
          
          return { 
            width: Math.min(boxWidth, width - 20), 
            height: Math.min(boxHeight, height - 20) 
          };
        },
        aspectRatio: 1.333333
      };

      // Try starting with clear, sharp HD constraints for optimal barcode line recognition
      try {
        const highResTarget = selectedCameraId 
          ? { 
              deviceId: { exact: selectedCameraId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          : { 
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 }
            };

        await html5QrCodeRef.current.start(
          highResTarget,
          config,
          qrCodeSuccessCallback,
          () => {}
        );
      } catch (resolutionError) {
        console.warn("Could not load camera with HD constraints, falling back to basic camera target:", resolutionError);
        
        const basicTarget = selectedCameraId || { facingMode: "environment" };
        await html5QrCodeRef.current.start(
          basicTarget,
          config,
          qrCodeSuccessCallback,
          () => {}
        );
      }

      setIsWebcamActive(true);
    } catch (err: any) {
      console.error("Webcam startup failed:", err);
      let userFriendlyMsg = err.message || "Failed to initialize camera. Ensure permission is granted and device is connected.";
      const errorString = String(err).toLowerCase();
      const errorMessage = (err.message || "").toLowerCase();
      const errorName = (err.name || "").toLowerCase();
      
      if (
        errorName.includes('notallowederror') || 
        errorString.includes('notallowederror') || 
        errorMessage.includes('permission denied') ||
        errorString.includes('permission denied')
      ) {
        userFriendlyMsg = "Camera Access Denied. Please allow camera permissions in your browser. Since the application runs in a secure preview iframe, click \"Open in a new tab\" at the top right of the screen to grant permissions directly on the top-level tab!";
      } else if (errorName.includes('notfounderror') || errorMessage.includes('notfounderror')) {
        userFriendlyMsg = "No webcam device found on your system. Please verify that a camera is plugged in and recognized.";
      }
      setWebcamError(userFriendlyMsg);
      setIsWebcamActive(false);
    } finally {
      setIsWebcamLoading(false);
    }
  };

  const stopWebcam = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Webcam shutdown error:", err);
      }
    }
    setIsWebcamActive(false);
  };

  const handleToggleWebcam = async () => {
    if (isWebcamActive) {
      await stopWebcam();
    } else {
      await startWebcam();
    }
  };

  // Beep synthesis sound (FMD style)
  const triggerBeepSound = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // High pitched beep
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
      } else if (type === 'warning') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("Audio Context beep failed", e);
    }
  };

  // Keyboard listener for physical hardware scanners
  // Hardware scanners mimic rapid keyboard events ending in 'Enter'.
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      
      // If time since last keystroke is small (< 50ms), it's likely a hardware scanner
      const isRapid = currentTime - lastKeyTime.current < 50;
      lastKeyTime.current = currentTime;

      if (e.key === 'Enter') {
        if (keyBuffer.current.length > 3) {
          // Trigger scan!
          const barcode = keyBuffer.current;
          keyBuffer.current = '';
          executeBarcodeScan(barcode);
        } else {
          keyBuffer.current = '';
        }
      } else if (e.key.length === 1) { // Normal alphanumeric characters
        if (isRapid || keyBuffer.current === '') {
          keyBuffer.current += e.key;
        } else {
          // If slow, reset buffer and start fresh with current key (normal typing)
          keyBuffer.current = e.key;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [products, scanMode]);

  // Simulated green laser sweep animation
  useEffect(() => {
    if (!isScanningActive) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let sweepY = 50;
    let direction = 1.5;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw dark overlay with transparency
      ctx.fillStyle = 'rgba(20, 20, 20, 0.45)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw target scanning square box
      const boxSize = 160;
      const x = (canvas.width - boxSize) / 2;
      const y = (canvas.height - boxSize) / 2;

      ctx.clearRect(x, y, boxSize, boxSize); // clear center transparently
      
      // Draw scan target boundaries
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, boxSize, boxSize);

      // Green sweeping laser line
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#10B981';
      ctx.beginPath();
      ctx.moveTo(x, y + sweepY);
      ctx.lineTo(x + boxSize, y + sweepY);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      // Update sweep positions
      sweepY += direction;
      if (sweepY >= boxSize || sweepY <= 0) {
        direction = -direction;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isScanningActive]);

  // Main Barcode Processing Engine
  const executeBarcodeScan = (barcode: string) => {
    if (!barcode || barcode.trim() === '') return;
    const cleanBarcode = barcode.trim();
    
    // Scan matching product
    const product = products.find(p => p.barcode === cleanBarcode);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logId = `SL-${Math.floor(1000 + Math.random() * 9000)}`;

    if (product) {
      let quantityChange = 0;
      let newLog: ScanLog;

      if (scanMode === 'CHECK_IN') {
        quantityChange = 1;
        onUpdateProductQuantity(cleanBarcode, 1, 'add');
        triggerBeepSound('success');
        
        newLog = {
          id: logId,
          timestamp,
          barcode: cleanBarcode,
          productName: product.name,
          type: 'CHECK_IN',
          quantityChange,
          status: 'SUCCESS',
          message: `Scanned & Checked In 1 ${product.unit}. New Stock: ${product.quantity + 1}.`
        };

        setScanStatus({
          status: 'SUCCESS',
          message: `Checked in 1 ${product.unit} of ${product.name}!`,
          product: { ...product, quantity: product.quantity + 1 },
          scannedBarcode: cleanBarcode
        });

      } else if (scanMode === 'CHECK_OUT') {
        if (product.quantity <= 0) {
          triggerBeepSound('error');
          newLog = {
            id: logId,
            timestamp,
            barcode: cleanBarcode,
            productName: product.name,
            type: 'CHECK_OUT',
            quantityChange: 0,
            status: 'FAILED',
            message: `Checkout failed: ${product.name} is completely out of stock.`
          };

          setScanStatus({
            status: 'ERROR',
            message: `Failed: ${product.name} has 0 items remaining!`,
            product,
            scannedBarcode: cleanBarcode
          });
        } else {
          quantityChange = -1;
          onUpdateProductQuantity(cleanBarcode, -1, 'add');
          triggerBeepSound('success');

          const fellBelow = product.quantity - 1 <= product.minStock;
          newLog = {
            id: logId,
            timestamp,
            barcode: cleanBarcode,
            productName: product.name,
            type: 'CHECK_OUT',
            quantityChange,
            status: fellBelow ? 'WARNING' : 'SUCCESS',
            message: fellBelow 
              ? `Checked out 1 ${product.unit}. Warning: Quantity fell to/below minimum threshold.` 
              : `Checked out 1 ${product.unit} of ${product.name}.`
          };

          setScanStatus({
            status: fellBelow ? 'WARNING' : 'SUCCESS' as any,
            message: fellBelow 
              ? `Checked out 1 ${product.unit}. Alert: Item is now low in stock!` 
              : `Checked out 1 ${product.unit} of ${product.name}!`,
            product: { ...product, quantity: product.quantity - 1 },
            scannedBarcode: cleanBarcode
          });
        }

      } else if (scanMode === 'DECOMMISSION') {
        onUpdateProductQuantity(cleanBarcode, 0, 'set');
        triggerBeepSound('warning');

        newLog = {
          id: logId,
          timestamp,
          barcode: cleanBarcode,
          productName: product.name,
          type: 'DECOMMISSION',
          quantityChange: -product.quantity,
          status: 'SUCCESS',
          message: `FMD Protocol: Product de-commissioned from system. Inventory set to 0.`
        };

        setScanStatus({
          status: 'SUCCESS',
          message: `FMD Success: ${product.name} decommissioned successfully.`,
          product: { ...product, quantity: 0 },
          scannedBarcode: cleanBarcode
        });

      } else { // VERIFY
        triggerBeepSound('success');
        const isExpired = product.expiryDate ? new Date(product.expiryDate) < new Date() : false;
        
        newLog = {
          id: logId,
          timestamp,
          barcode: cleanBarcode,
          productName: product.name,
          type: 'VERIFY',
          quantityChange: 0,
          status: isExpired ? 'FAILED' : 'SUCCESS',
          message: isExpired 
            ? `Safety Violation: Product failed FMD check due to Expiry Date (${product.expiryDate}) expiration.` 
            : `FMD Verification: Authenticity, Serial (${product.serialNumber || 'N/A'}), and Expiry (${product.expiryDate || 'N/A'}) confirmed.`
        };

        setScanStatus({
          status: isExpired ? 'ERROR' : 'SUCCESS',
          message: isExpired 
            ? `Critical: Safety Warning! Medicine expired on ${product.expiryDate}!` 
            : `Verified Authentic! Serial: ${product.serialNumber || 'N/A'}`,
          product,
          scannedBarcode: cleanBarcode
        });
      }

      onAddLog(newLog);

    } else {
      // Product not found in catalog! Provide immediate registration action
      triggerBeepSound('error');
      
      const newLog: ScanLog = {
        id: logId,
        timestamp,
        barcode: cleanBarcode,
        productName: 'Unregistered Item',
        type: 'VERIFY',
        quantityChange: 0,
        status: 'FAILED',
        message: `Unknown barcode scanned: ${cleanBarcode}. System suggested manual catalog entry.`
      };

      onAddLog(newLog);

      setScanStatus({
        status: 'NOT_FOUND',
        message: `Barcode "${cleanBarcode}" was not found in your inventory catalog.`,
        scannedBarcode: cleanBarcode
      });
    }
  };

  // Simulated Camera Scan trigger
  const handleSimulateVideoScan = () => {
    setIsScanningActive(true);
    setScanStatus({ status: 'IDLE', message: '' });

    // Choose a random product or occasionally an unregistered one to scan after 2 seconds
    setTimeout(() => {
      setIsScanningActive(false);
      
      const barcodes = [...products.map(p => p.barcode), '99023411', '40084000', '12000000'];
      const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
      
      executeBarcodeScan(randomBarcode);
    }, 2200);
  };

  // Fast demo scan helpers
  const handleFastDemoScan = (barcode: string) => {
    executeBarcodeScan(barcode);
  };

  // Form states for creating new product instantly when not found
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Groceries');
  const [newProdUnit, setNewProdUnit] = useState('pcs');
  const [newProdMinStock, setNewProdMinStock] = useState(2);
  const [newProdSerial, setNewProdSerial] = useState('');
  const [newProdExpiry, setNewProdExpiry] = useState('');

  const handleRegisterFromScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !scanStatus.scannedBarcode) return;

    const newProduct: FamilyProduct = {
      barcode: scanStatus.scannedBarcode,
      name: newProdName,
      description: `Manually verified family asset. Registered via FMD Scan Station.`,
      category: newProdCategory,
      quantity: scanMode === 'CHECK_IN' ? 1 : 0,
      unit: newProdUnit,
      minStock: Number(newProdMinStock),
      isFavorite: false,
      serialNumber: newProdSerial || `SN-M-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: newProdExpiry || undefined
    };

    onRegisterNewProduct(newProduct);
    
    // Add success log
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    onAddLog({
      id: `SL-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp,
      barcode: scanStatus.scannedBarcode,
      productName: newProduct.name,
      type: 'CHECK_IN',
      quantityChange: newProduct.quantity,
      status: 'SUCCESS',
      message: `Newly registered barcode catalog entry: ${newProduct.name}. Registered with stock: ${newProduct.quantity}.`
    });

    setScanStatus({
      status: 'SUCCESS',
      message: `Successfully registered and stored "${newProduct.name}"!`,
      product: newProduct,
      scannedBarcode: scanStatus.scannedBarcode
    });

    // Reset inputs
    setNewProdName('');
    setNewProdSerial('');
    setNewProdExpiry('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-mono font-bold uppercase tracking-wider rounded border border-blue-100/40">
              Hardware Scanner Mode Active
            </span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 text-gray-400 hover:text-gray-600 bg-gray-50 rounded border border-gray-200"
              title={soundEnabled ? 'Disable Scan Sound' : 'Enable Scan Sound'}
            >
              {soundEnabled ? <Volume2 size={12} className="text-blue-500" /> : <VolumeX size={12} />}
            </button>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <QrCode className="text-blue-500" size={28} />
            FMD Stock Verification Terminal
          </h2>
          <p className="text-gray-400 text-sm font-light mt-1">
            Listening globally for keyboard barcode events. Simply point your scanner at the screen and scan, or use the controls below.
          </p>
        </div>
      </div>

      {/* Control Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Scanner Device Window */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Scanner Viewport</h3>
              <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase border border-blue-100">Webcam Support</span>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-gray-50 p-1 rounded-xl text-xs font-medium border border-gray-100">
              <button
                onClick={async () => {
                  await stopWebcam();
                  setScannerType('webcam');
                }}
                className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                  scannerType === 'webcam' ? 'bg-black text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Real Web Camera
              </button>
              <button
                onClick={async () => {
                  await stopWebcam();
                  setScannerType('simulation');
                }}
                className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                  scannerType === 'simulation' ? 'bg-black text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Simulator Sweep
              </button>
            </div>
            
            {/* Conditional Views */}
            {scannerType === 'webcam' ? (
              <div className="space-y-3">
                {/* Real Web Camera view */}
                <div className="relative w-full aspect-square md:aspect-video rounded-xl bg-neutral-900 border border-neutral-850 overflow-hidden flex flex-col items-center justify-center">
                  {/* Container for html5-qrcode video - ALWAYS rendered with size to avoid initialization collapse */}
                  <div 
                    id="webcam-scanner-viewport" 
                    className="absolute inset-0 w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full [&_video]:rounded-xl"
                  />
                  
                  {/* Real-time laser guide overlay matching the exact 0.85 x 0.45 horizontal qrbox size */}
                  {isWebcamActive && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center p-4">
                      {/* Precise horizontal container matching the scan scope */}
                      <div className="w-[85%] h-[45%] border-2 border-dashed border-emerald-500 rounded-xl relative overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        {/* Subtle inner pulse shading */}
                        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                        
                        {/* Laser horizontal bar sweeping down and up using bouncing translation */}
                        <div className="absolute w-[95%] h-[2px] bg-red-500 shadow-[0_0_10px_#ef4444,0_0_20px_#ef4444] animate-bounce"></div>
                        
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                          <span className="text-[9px] tracking-wider font-bold text-emerald-300 bg-black/75 px-2 py-0.5 rounded uppercase font-mono">
                            ALIGN BARCODE HERE
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-neutral-300 font-medium mt-3 bg-black/60 px-3 py-1 rounded-full text-center">
                        Hold item steady • Distance ~ 10-15 cm
                      </p>
                    </div>
                  )}
                  
                  {!isWebcamActive && !isWebcamLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-neutral-450 z-10 bg-neutral-900 space-y-3">
                      <Camera size={44} className="mx-auto text-neutral-600 stroke-1" />
                      <div>
                        <p className="text-xs font-semibold text-neutral-300">Webcam Scanner Ready</p>
                        <p className="text-[10px] text-neutral-500 max-w-xs mx-auto mt-1 leading-relaxed">
                          Hold your medicine, grocery, or barcode directly to the webcam lens, and the system will automatically parse and execute stock sync.
                        </p>
                      </div>
                    </div>
                  )}

                  {isWebcamLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-neutral-450 z-10 bg-neutral-900 space-y-3">
                      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-neutral-450 font-light">Requesting webcam stream...</p>
                    </div>
                  )}

                  {webcamError && (
                    <div className="absolute inset-0 bg-neutral-950 p-6 flex flex-col items-center justify-center text-center z-20 space-y-3">
                      <AlertTriangle size={32} className="text-amber-500" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-neutral-200">Webcam Feed Restricted</p>
                        <p className="text-[10px] text-neutral-450 max-w-xs">{webcamError}</p>
                      </div>
                      <button 
                        onClick={startWebcam}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-[10px] rounded-lg transition-all cursor-pointer"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>

                {/* Webcam Toggle Action */}
                <button
                  onClick={handleToggleWebcam}
                  disabled={isWebcamLoading}
                  className={`w-full py-2.5 text-xs font-bold transition-all rounded-full flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                    isWebcamActive 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-black hover:bg-gray-800 text-white disabled:bg-gray-200 disabled:text-gray-400'
                  }`}
                >
                  {isWebcamLoading ? (
                    <>Connecting camera device...</>
                  ) : isWebcamActive ? (
                    <>
                      <Square size={12} className="fill-white" /> Stop Webcam Scanner
                    </>
                  ) : (
                    <>
                      <Play size={12} className="fill-white" /> Start Webcam Scanner
                    </>
                  )}
                </button>

                {/* Camera source chooser */}
                {cameras.length > 1 && (
                  <div className="pt-2 border-t border-gray-100 flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Select Webcam Device</label>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => setSelectedCameraId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 text-[11px] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      {cameras.map((cam) => (
                        <option key={cam.id} value={cam.id}>
                          {cam.label || `Webcam ${cameras.indexOf(cam) + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Visual Screen simulating camera scan */}
                <div className="relative w-full aspect-square md:aspect-video rounded-xl bg-neutral-900 border border-neutral-850 overflow-hidden flex flex-col items-center justify-center">
                  {isScanningActive ? (
                    <canvas 
                      ref={canvasRef} 
                      className="absolute inset-0 w-full h-full object-cover" 
                      width={400} 
                      height={220} 
                    />
                  ) : (
                    <div className="text-center p-6 text-neutral-450 z-10 space-y-3">
                      <Camera size={44} className="mx-auto text-neutral-600 stroke-1" />
                      <div>
                        <p className="text-xs font-semibold text-neutral-300">Simulator Sweep Ready</p>
                        <p className="text-[10px] text-neutral-500 max-w-xs mx-auto mt-1 leading-relaxed">
                          Click "Simulate Optical Scan sweep" to automatically trigger a sample verification scan.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Laser animation indicator overlay */}
                  {isScanningActive && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-mono rounded animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      SCANNING SWEEP...
                    </div>
                  )}
                </div>

                {/* Sweep button trigger */}
                <button
                  onClick={handleSimulateVideoScan}
                  disabled={isScanningActive}
                  className="w-full py-2.5 bg-black hover:bg-gray-800 disabled:bg-gray-200 text-white disabled:text-gray-400 text-xs font-bold transition-all rounded-full flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isScanningActive ? (
                    <>Analyzing Optical Signal...</>
                  ) : (
                    <>
                      <Play size={12} className="fill-white" /> Simulate Optical Scan sweep
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick Demo Scan list (Click to instantly simulate) */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Quick Demo Barcodes</span>
              <span className="text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded font-bold">Try clicking!</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {products.slice(0, 4).map(p => (
                <button
                  key={p.barcode}
                  onClick={() => handleFastDemoScan(p.barcode)}
                  className="p-2 border border-gray-100 hover:border-blue-300 hover:bg-blue-50/10 text-left rounded-lg truncate transition-all"
                  title={`Scan: ${p.name}`}
                >
                  <strong className="text-gray-800 block truncate">{p.name}</strong>
                  <span className="font-mono text-gray-400 text-[9px]">BC: {p.barcode}</span>
                </button>
              ))}
              <button
                onClick={() => handleFastDemoScan('99001122')}
                className="p-2 border border-dashed border-gray-200 hover:border-red-300 text-left rounded-lg transition-all text-gray-400"
              >
                <strong className="text-gray-700 block truncate">+ Unregistered Code</strong>
                <span className="font-mono text-[9px]">BC: 99001122</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Scan Action Settings & Output Display */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Scan Action Mode Selector */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Scanner Calibration</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'CHECK_IN', label: 'Check In (+1)', desc: 'Add item to stock' },
                { id: 'CHECK_OUT', label: 'Check Out (-1)', desc: 'Consume stock' },
                { id: 'VERIFY', label: 'FMD Verify', desc: 'Auth & Expiry check' },
                { id: 'DECOMMISSION', label: 'Decommission', desc: 'FMD De-activate (0)' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setScanMode(mode.id as any)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    scanMode === mode.id
                      ? 'border-blue-500 bg-blue-50/10 shadow-xs text-blue-900'
                      : 'border-gray-100 hover:bg-gray-50/50 text-gray-600'
                  }`}
                >
                  <span className="font-bold text-xs uppercase tracking-wide">{mode.label}</span>
                  <span className="text-[10px] text-gray-400 font-light mt-1">{mode.desc}</span>
                </button>
              ))}
            </div>

            {/* Manual Text Barcode Input */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 font-mono block mb-2">Manual Barcode Dispatcher</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type barcode (e.g. 40084911)"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeBarcodeScan(manualBarcode)}
                  className="flex-1 px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  onClick={() => executeBarcodeScan(manualBarcode)}
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold"
                >
                  Dispatch Scan
                </button>
              </div>
            </div>
          </div>

          {/* Output / Feedback Screen */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs min-h-[220px] flex flex-col justify-center">
            {scanStatus.status === 'IDLE' ? (
              <div className="text-center py-6 text-gray-400 space-y-1.5">
                <ShieldCheck size={36} className="mx-auto text-gray-300 stroke-1" />
                <p className="text-xs font-semibold">Ready for System Input</p>
                <p className="text-[10px] max-w-xs mx-auto font-light">Trigger any barcode scanner scan. Authentic verification takes less than 12 milliseconds.</p>
              </div>
            ) : scanStatus.status === 'SUCCESS' || scanStatus.status === 'WARNING' ? (
              <div className="space-y-5">
                <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
                  <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50">
                    <CheckCircle2 size={24} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-800">Scan Processed Successfully</h3>
                    <p className="text-xs text-emerald-600 mt-0.5">{scanStatus.message}</p>
                  </div>
                </div>

                {/* Scanned product card details */}
                {scanStatus.product && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider font-mono">Product Profile</span>
                      <p className="font-bold text-gray-800 text-sm leading-tight">{scanStatus.product.name}</p>
                      <p className="text-gray-500 font-light text-[11px] leading-relaxed">{scanStatus.product.description}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5 font-mono text-[10px] text-gray-500">
                      <div className="flex justify-between">
                        <span>Barcode ID:</span>
                        <strong className="text-gray-700">{scanStatus.product.barcode}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Stock:</span>
                        <strong className="text-gray-700">{scanStatus.product.quantity} {scanStatus.product.unit}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>FMD Serial:</span>
                        <strong className="text-gray-700">{scanStatus.product.serialNumber || 'N/A'}</strong>
                      </div>
                      {scanStatus.product.expiryDate && (
                        <div className="flex justify-between">
                          <span>Expiry Date:</span>
                          <strong className="text-gray-750 font-bold">{scanStatus.product.expiryDate}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : scanStatus.status === 'ERROR' ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100/40">
                    <AlertTriangle size={24} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-red-800">Safety Verification Warning</h3>
                    <p className="text-xs text-red-600 mt-0.5">{scanStatus.message}</p>
                  </div>
                </div>
                {scanStatus.product && (
                  <div className="p-3 bg-red-50/20 border border-red-100/30 rounded-xl text-xs text-gray-600">
                    The item <strong>{scanStatus.product.name}</strong> was rejected by active systems checks. Verify expiration codes or serial numbers immediately.
                  </div>
                )}
              </div>
            ) : (
              // --- NOT FOUND PANEL (Instant registration) ---
              <div className="space-y-5">
                <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
                  <span className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/40">
                    <Plus size={24} className="text-amber-500" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-amber-800">New Product Detected</h3>
                    <p className="text-xs text-amber-600 mt-0.5">{scanStatus.message}</p>
                  </div>
                </div>

                {/* Instant registration Form */}
                <form onSubmit={handleRegisterFromScan} className="space-y-4">
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider block">Quick-Register Catalog Entry</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Product Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Diet Coke 330ml Can"
                        required
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Category</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 bg-white rounded-lg focus:outline-none"
                      >
                        <option value="Groceries">Groceries</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Medicines (FMD)">Medicines (FMD)</option>
                        <option value="Household">Household</option>
                        <option value="Electronics">Electronics</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Stock Unit</label>
                      <input
                        type="text"
                        placeholder="e.g. cans, boxes, pcs"
                        value={newProdUnit}
                        onChange={(e) => setNewProdUnit(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">Reorder Alert Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={newProdMinStock}
                        onChange={(e) => setNewProdMinStock(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase">FMD Expiry (Optional)</label>
                      <input
                        type="date"
                        value={newProdExpiry}
                        onChange={(e) => setNewProdExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-bold transition-all shadow-sm"
                  >
                    Confirm Register & Save entry
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
