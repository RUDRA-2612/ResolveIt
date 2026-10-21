import { useState, useRef, useEffect } from 'react';
import { AlertCircle, ChevronDown, ShieldCheck, Camera, X, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ISSUE_DATA, DEPARTMENT_BUILDINGS } from '../../taxonomy';
import { useCamera } from '../../hooks/useCamera';

interface CustomSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder: string;
    disabled?: boolean;
}

const CustomSelect = ({ value, onChange, options, placeholder, disabled = false }: CustomSelectProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={ref}>
            <div
                onClick={() => setOpen(!open)}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 font-medium cursor-pointer flex justify-between items-center transition-all shadow-sm hover:border-teal-300"
            >
                <span className={!value ? "text-slate-400" : "truncate pr-2"}>{value || placeholder}</span>
                <ChevronDown size={18} className={`text-slate-400 shrink-0 transform transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>

            {open && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto smooth-enter-up">
                    {options.map((opt) => (
                        <div
                            key={opt}
                            onClick={() => { onChange(opt); setOpen(false); }}
                            className={`px-4 py-3 cursor-pointer text-sm font-medium transition-colors ${value === opt ? 'bg-teal-100 text-teal-800' : 'text-slate-700 hover:bg-teal-100 hover:text-teal-900'}`}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface ReportIssueFormProps {
    onSubmitTicket: (formData: {
        department: string;
        category: string;
        specificIssue: string;
        building: string;
        issueTitle: string;
        exactLocation: string;
        detailedDescription: string;
        incidentDate: string;
        isConfidential: boolean;
        capturedImage: string | null;
    }) => void | Promise<void>;
    onPushModalState: () => void;
}

export function ReportIssueForm({ onSubmitTicket, onPushModalState }: ReportIssueFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [department, setDepartment] = useState('');
    const [category, setCategory] = useState('');
    const [specificIssue, setSpecificIssue] = useState('');
    const [building, setBuilding] = useState('');
    const [issueTitle, setIssueTitle] = useState('');
    const [exactLocation, setExactLocation] = useState('');
    const [detailedDescription, setDetailedDescription] = useState('');
    const [incidentDate, setIncidentDate] = useState('');
    const [isConfidential, setIsConfidential] = useState(false);

    const {
        videoRef,
        canvasRef,
        cameraActive,
        photoTaken,
        capturedImage,
        cameraError,
        startCamera,
        takePhoto,
        resetPhoto,
    } = useCamera();

    const handleSubmit = async () => {
        if (!capturedImage) {
            setSubmitError('Take a live evidence photo before submitting this ticket.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await onSubmitTicket({
                department,
                category,
                specificIssue,
                building,
                issueTitle,
                exactLocation,
                detailedDescription,
                incidentDate,
                isConfidential,
                capturedImage,
            });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Could not submit the ticket.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 view-slide-in">
            <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/60 rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-orange-50/30 border-b border-slate-100 p-7 flex items-center gap-4">
                    <div className="p-3.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-orange-500/25">
                        <AlertCircle size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Report a Problem</h2>
                        <p className="text-slate-500 text-sm font-medium mt-0.5">Submit an official ticket for fast resolution.</p>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Department</label>
                            <CustomSelect
                                value={department}
                                onChange={(val) => {
                                    setDepartment(val);
                                    setCategory('');
                                    setSpecificIssue('');
                                    setBuilding('');
                                }}
                                options={Object.keys(ISSUE_DATA)}
                                placeholder="Select department..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Category</label>
                            <CustomSelect
                                value={category}
                                onChange={(val) => {
                                    setCategory(val);
                                    setSpecificIssue('');
                                }}
                                disabled={!department}
                                options={department && ISSUE_DATA[department] ? Object.keys(ISSUE_DATA[department]) : []}
                                placeholder={!department ? 'Select dept first...' : 'Select category...'}
                            />
                        </div>

                        {category && department && ISSUE_DATA[department] && ISSUE_DATA[department][category] && (
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Specific Issue</label>
                                <CustomSelect
                                    value={specificIssue}
                                    onChange={(val) => setSpecificIssue(val)}
                                    options={ISSUE_DATA[department][category]}
                                    placeholder="Select the exact issue..."
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Issue Title</label>
                            <Input
                                type="text"
                                value={issueTitle}
                                onChange={(e) => setIssueTitle(e.target.value)}
                                placeholder="Short description"
                                className="w-full h-14 px-4 bg-slate-50 border-slate-200 rounded-xl text-slate-700 font-medium"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Building / Facility</label>
                                <CustomSelect
                                    value={building}
                                    onChange={(val) => setBuilding(val)}
                                    disabled={!department}
                                    options={department && DEPARTMENT_BUILDINGS[department] ? DEPARTMENT_BUILDINGS[department] : []}
                                    placeholder={!department ? "Select dept first..." : "Select Building..."}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Exact Location</label>
                                <Input
                                    type="text"
                                    value={exactLocation}
                                    onChange={(e) => setExactLocation(e.target.value)}
                                    placeholder="Floor, room, zone, equipment or bus number"
                                    className="w-full h-14 px-4 bg-white border-slate-200 rounded-xl text-slate-700 font-medium"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Date (If specific incident)</label>
                                <input
                                    type="date"
                                    value={incidentDate}
                                    onChange={(e) => setIncidentDate(e.target.value)}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Detailed Description</label>
                                <Textarea
                                    value={detailedDescription}
                                    onChange={(e) => setDetailedDescription(e.target.value)}
                                    placeholder="Context and specifics of the problem..."
                                    className="w-full p-4 bg-white border-slate-200 rounded-xl text-slate-700 font-medium resize-none min-h-[120px]"
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
                                <input
                                    type="checkbox"
                                    id="confidential"
                                    checked={isConfidential}
                                    onChange={(e) => setIsConfidential(e.target.checked)}
                                    className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                                />
                                <label htmlFor="confidential" className="text-slate-700 font-medium flex items-center gap-2 cursor-pointer flex-1">
                                    <ShieldCheck size={18} className="text-teal-600" />
                                    Mark as Confidential
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Camera className="text-teal-600" size={20} /> Live Evidence</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">Required</span>
                        </div>

                        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center min-h-[300px]">
                            {!cameraActive && !photoTaken ? (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                        <Camera size={32} className="text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 text-sm mb-6 max-w-sm">
                                        You must take a live photo of the issue.
                                    </p>
                                    <button onClick={() => { onPushModalState(); startCamera(); }} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-md">
                                        <Camera size={18} /> Open Camera
                                    </button>
                                </div>
                            ) : cameraActive && !photoTaken ? (
                                <div className="w-full max-w-lg bg-black rounded-xl overflow-hidden relative aspect-video flex items-center justify-center">
                                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted></video>
                                    <button
                                        onClick={takePhoto}
                                        className="absolute bottom-6 w-16 h-16 bg-white/20 border-4 border-white rounded-full z-10 hover:bg-white/40 transition-colors backdrop-blur-sm shadow-lg"
                                    ></button>
                                </div>
                            ) : (
                                <div className="w-full max-w-lg relative aspect-video">
                                    <div className="absolute inset-0 bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center border-4 border-slate-200">
                                        {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
                                    </div>
                                    <button
                                        onClick={resetPhoto}
                                        className="absolute -top-3 -right-3 bg-white text-slate-800 p-2.5 rounded-full hover:bg-slate-100 transition-colors shadow-lg border border-slate-200"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}
                            <canvas ref={canvasRef} className="hidden"></canvas>
                            {cameraError && <p role="alert" className="mt-4 text-sm font-semibold text-rose-700">{cameraError}</p>}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-end">
                    <div className="flex w-full flex-col items-end gap-3">
                        {submitError && <p role="alert" className="w-full text-sm font-semibold text-rose-700">{submitError}</p>}
                        <Button
                            onClick={() => void handleSubmit()}
                            disabled={isSubmitting}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg py-6 px-10 rounded-xl shadow-md transition-all flex items-center gap-2"
                        >
                            <CheckCircle size={20} />
                            {isSubmitting ? 'Submitting…' : 'Submit Ticket'}
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}