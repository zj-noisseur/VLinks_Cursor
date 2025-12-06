import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Map,
  MessageCircle,
  Play,
  Pause,
  Share2,
  Sparkles,
  Mic,
  Send,
  X,
  Link,
  Download,
  Instagram,
  Facebook,
  Video,
  Volume2,
  Lock,
  Clock,
  Key,
  PenLine,
  Mail,
  CalendarHeart,
  Book,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  FileText,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import exifr from "exifr";
import { analyzeFile } from "../lib/gemini";

type Tab = "timeline" | "echo" | "vault" | "letters";

// Define a type for your artifacts to avoid 'any'
interface Artifact {
  id: string;
  year: string;
  title: string;
  desc: string;
  type: string;
  duration?: string;
  color: string;
  filePath?: string;
  textContent?: string;
  metadata?: any;
}

// ------------------- 1. Sensory Timeline -------------------
const TimelineTab = () => {
  // --- Audio Upload Logic ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioUploadStatus, setAudioUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [audioUploadMessage, setAudioUploadMessage] = useState("");

  // --- Text Upload Logic ---
  const textFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingText, setUploadingText] = useState(false);
  const [textUploadStatus, setTextUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [textUploadMessage, setTextUploadMessage] = useState("");

  // --- Image Upload Logic ---
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [imageUploadMessage, setImageUploadMessage] = useState("");

  // --- Audio Player State ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // --- Artifacts State ---
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loadingArtifacts, setLoadingArtifacts] = useState(true);
  const [displayCount, setDisplayCount] = useState(3);

  // Hardcoded artifacts
  const hardcodedArtifacts: Artifact[] = [
    {
      id: "hardcoded-1",
      year: "1968",
      title: "The Voice Tape",
      desc: "Found in the attic. Practice for the wedding.",
      type: "audio",
      duration: "0:45",
      color: "bg-orange-50",
    },
    {
      id: "hardcoded-2",
      year: "1975",
      title: "Kopitiam Corner",
      desc: 'Every Sunday at 7 AM. "Kopi O Kosong, extra hot."',
      type: "location",
      color: "bg-emerald-50",
    },
    {
      id: "hardcoded-3",
      year: "1992",
      title: "The Old Guitar",
      desc: "He only knew three chords, but played with heart.",
      type: "music",
      color: "bg-indigo-50",
    },
  ];

  // Helper to process fetched data
  const processArtifacts = (data: any[]) => {
    const colors: Record<string, string> = {
      audio: "bg-orange-50",
      photo: "bg-indigo-50",
      text: "bg-emerald-50",
    };

    return data.map((asset) => {
      const year = new Date(asset.content_date).getFullYear().toString();
      return {
        id: asset.id,
        year,
        title: asset.title || "Untitled Memory",
        desc: asset.description || "A precious moment captured in time.",
        type: asset.asset_type,
        duration: asset.asset_type === "audio" ? "0:00" : undefined,
        color: colors[asset.asset_type] || "bg-stone-50",
        filePath: asset.file_path,
        textContent: asset.text_content,
        metadata: asset.metadata,
      };
    });
  };

  const fetchArtifacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingArtifacts(false);
        return;
      }

      const { data, error } = await supabase
        .from("memoir_assets")
        .select("*")
        .eq("user_id", user.id)
        .order("content_date", { ascending: true });

      if (error) throw error;
      setArtifacts(processArtifacts(data || []));
    } catch (error) {
      console.error("Error fetching artifacts:", error);
    } finally {
      setLoadingArtifacts(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchArtifacts();
  }, []);

  const refreshArtifacts = async () => {
    await fetchArtifacts();
  };

  const allArtifacts = [...hardcodedArtifacts, ...artifacts];
  const displayedArtifacts = allArtifacts.slice(0, displayCount);
  const hasMore = allArtifacts.length > displayCount;

  const loadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 3, allArtifacts.length));
  };

  const handlePlayAudio = async (item: Artifact) => {
    if (!item.filePath || item.type !== "audio") return;

    if (currentPlayingId === item.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (currentPlayingId === item.id && !isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
      return;
    }

    try {
      const { data } = supabase.storage
        .from("audio_uploads")
        .getPublicUrl(item.filePath);

      if (audioRef.current) {
        audioRef.current.src = data.publicUrl;
        audioRef.current.load();

        audioRef.current.onloadedmetadata = () => {
          setAudioDuration(audioRef.current?.duration || 0);
        };

        audioRef.current.ontimeupdate = () => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setAudioProgress(
              (audioRef.current.currentTime / audioRef.current.duration) * 100
            );
          }
        };

        audioRef.current.onended = () => {
          setIsPlaying(false);
          setAudioProgress(0);
          setCurrentTime(0);
        };

        await audioRef.current.play();
        setCurrentPlayingId(item.id);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    // FIXED: Added backticks for template literal
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleButtonClick = () => fileInputRef.current?.click();
  const handleTextButtonClick = () => textFileInputRef.current?.click();
  const handleImageButtonClick = () => imageFileInputRef.current?.click();

  // --- Audio Upload Handler ---
  const handleAudioFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/m4a",
      "audio/aac",
      "audio/ogg",
      "audio/webm",
    ];
    const hasValidExtension = file.name.match(
      /\.(mp3|wav|m4a|aac|ogg|webm)$/i
    );
    const hasValidMimeType = allowedTypes.includes(file.type);

    if (!hasValidExtension && !hasValidMimeType) {
      setAudioUploadStatus("error");
      setAudioUploadMessage(
        "Please upload a supported audio file (MP3, WAV, M4A, AAC, OGG, WEBM)"
      );
      setTimeout(() => setAudioUploadStatus("idle"), 3000);
      return;
    }

    setUploadingAudio(true);
    setAudioUploadStatus("idle");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("You must be logged in to upload audio");
      }
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      // FIXED: Added backticks for template literal
      const filePath = `${user.id}/${timestamp}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("audio_uploads")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      setAudioUploadMessage("Analyzing audio with AI...");
      const aiAnalysis = await analyzeFile(file, "audio");
      const aiResult = aiAnalysis || {
        title: null,
        description: null,
        text_content: null,
      };

      const contentDate = file.lastModified
        ? new Date(file.lastModified).toISOString()
        : new Date().toISOString();

      const { error: dbError } = await supabase
        .from("memoir_assets")
        .insert({
          user_id: user.id,
          file_path: filePath,
          memoir_id: null,
          asset_type: "audio",
          content_date: contentDate,
          title: aiResult.title,
          description: aiResult.description,
          text_content: aiResult.text_content,
          metadata: {
            original_filename: file.name,
            duration_seconds: null,
            format: fileExt?.toLowerCase() || null,
            file_size: file.size,
          },
          is_processed: aiResult.title ? true : false,
        });

      if (dbError) {
        await supabase.storage.from("audio_uploads").remove([filePath]);
        throw dbError;
      }

      setAudioUploadStatus("success");
      setAudioUploadMessage("Audio uploaded successfully!");
      await refreshArtifacts();
      setTimeout(() => setAudioUploadStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Upload error:", error);
      setAudioUploadStatus("error");
      setAudioUploadMessage(error.message || "Failed to upload audio");
      setTimeout(() => setAudioUploadStatus("idle"), 3000);
    } finally {
      setUploadingAudio(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- Text Upload Handler ---
  const handleTextFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "text/plain",
      "text/markdown",
      "text/csv",
      "application/octet-stream",
    ];
    const allowedExtensions = /\.(txt|md|markdown|csv)$/i;
    const hasValidExtension = file.name.match(allowedExtensions);
    const hasValidMimeType = allowedTypes.includes(file.type);

    if (!hasValidExtension && !hasValidMimeType) {
      setTextUploadStatus("error");
      setTextUploadMessage("Please upload a valid text file (TXT, MD, CSV)");
      setTimeout(() => setTextUploadStatus("idle"), 3000);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setTextUploadStatus("error");
      setTextUploadMessage("Text file must be less than 5MB");
      setTimeout(() => setTextUploadStatus("idle"), 3000);
      return;
    }

    setUploadingText(true);
    setTextUploadStatus("idle");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("You must be logged in to upload text files");
      }
      const timestamp = Date.now();
      // FIXED: Added backticks
      const filePath = `${user.id}/${timestamp}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("text_uploads")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const extension = file.name.split(".").pop()?.toLowerCase() || "txt";
      const docTypeMap: { [key: string]: string } = {
        txt: "text",
        md: "markdown",
        markdown: "markdown",
        csv: "csv",
      };
      const docType = docTypeMap[extension] || "text";

      setTextUploadMessage("Summarizing story...");
      const aiAnalysis = await analyzeFile(file, "text");
      const aiResult = aiAnalysis || {
        title: null,
        description: null,
        text_content: null,
      };

      const contentDate = file.lastModified
        ? new Date(file.lastModified).toISOString()
        : new Date().toISOString();

      const { error: dbError } = await supabase.from("memoir_assets").insert({
        user_id: user.id,
        file_path: filePath,
        memoir_id: null,
        asset_type: "text",
        content_date: contentDate,
        title: aiResult.title,
        description: aiResult.description,
        text_content: aiResult.text_content,
        metadata: {
          original_filename: file.name,
          doc_type: docType,
          file_size: file.size,
        },
        is_processed: aiResult.title ? true : false,
      });

      if (dbError) {
        await supabase.storage.from("text_uploads").remove([filePath]);
        // FIXED: Added backticks
        throw new Error(`Database error: ${dbError.message}`);
      }

      setTextUploadStatus("success");
      setTextUploadMessage("Story uploaded successfully!");
      await refreshArtifacts();
      setTimeout(() => setTextUploadStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Upload error:", error);
      setTextUploadStatus("error");
      setTextUploadMessage(error.message || "Failed to upload story");
      setTimeout(() => setTextUploadStatus("idle"), 3000);
    } finally {
      setUploadingText(false);
      if (textFileInputRef.current) textFileInputRef.current.value = "";
    }
  };

  // --- Image Upload Handler ---
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i;
    const hasValidExtension = file.name.match(allowedExtensions);
    const hasValidMimeType = allowedTypes.includes(file.type);

    if (!hasValidExtension && !hasValidMimeType) {
      setImageUploadStatus("error");
      setImageUploadMessage(
        "Please upload a valid image file (JPG, PNG, GIF, WEBP, HEIC)"
      );
      setTimeout(() => setImageUploadStatus("idle"), 3000);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageUploadStatus("error");
      setImageUploadMessage("Image file must be less than 10MB");
      setTimeout(() => setImageUploadStatus("idle"), 3000);
      return;
    }

    setUploadingImage(true);
    setImageUploadStatus("idle");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("You must be logged in to upload images");
      }
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      // FIXED: Added backticks
      const filePath = `${user.id}/${timestamp}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("photos_upload")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      setImageUploadMessage("Analyzing image context...");
      const aiAnalysis = await analyzeFile(file, "photo");
      const aiResult = aiAnalysis || { title: null, description: null };

      let contentDate: string;
      try {
        const exifData = await exifr.parse(file, {
          pick: ["DateTimeOriginal", "DateTime", "CreateDate"],
        });
        const exifDate =
          exifData?.DateTimeOriginal || exifData?.DateTime || exifData?.CreateDate;

        if (exifDate && exifDate instanceof Date) {
          contentDate = exifDate.toISOString();
        } else {
          contentDate = file.lastModified
            ? new Date(file.lastModified).toISOString()
            : new Date().toISOString();
        }
      } catch (exifError) {
        console.log(
          "Could not extract EXIF data, using file modification date:",
          exifError
        );
        contentDate = file.lastModified
          ? new Date(file.lastModified).toISOString()
          : new Date().toISOString();
      }

      const { error: dbError } = await supabase.from("memoir_assets").insert({
        user_id: user.id,
        file_path: filePath,
        memoir_id: null,
        asset_type: "photo",
        content_date: contentDate,
        title: aiResult.title,
        description: aiResult.description,
        text_content: null,
        metadata: {
          original_filename: file.name,
          width: null,
          height: null,
          format: fileExt?.toLowerCase() || null,
          file_size: file.size,
        },
        is_processed: aiResult.title ? true : false,
      });

      if (dbError) {
        await supabase.storage.from("photos_upload").remove([filePath]);
        throw dbError;
      }

      setImageUploadStatus("success");
      setImageUploadMessage("Image uploaded successfully!");
      await refreshArtifacts();
      setTimeout(() => setImageUploadStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Upload error:", error);
      setImageUploadStatus("error");
      setImageUploadMessage(error.message || "Failed to upload image");
      setTimeout(() => setImageUploadStatus("idle"), 3000);
    } finally {
      setUploadingImage(false);
      if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    }
  };

  return (
    <div className="px-5 py-6 space-y-8 relative min-h-screen bg-[#FDFBF7]">
      <audio ref={audioRef} className="hidden" />

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
        onChange={handleAudioFileChange}
        className="hidden"
        disabled={uploadingAudio}
      />
      <input
        ref={textFileInputRef}
        type="file"
        accept=".txt,.md,.markdown,.csv,text/plain,text/markdown,text/csv"
        onChange={handleTextFileChange}
        className="hidden"
        disabled={uploadingText}
      />
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif"
        onChange={handleImageChange}
        className="hidden"
        disabled={uploadingImage}
      />

      {/* Upload Status Toasts */}
      {audioUploadStatus !== "idle" && (
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] max-w-[380px] w-[calc(100%-3rem)] mx-auto px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl animate-fade-in-up ${
            audioUploadStatus === "success"
              ? "bg-emerald-500/95 border-emerald-400 text-white"
              : "bg-red-500/95 border-red-400 text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            {audioUploadStatus === "success" ? (
              <CheckCircle size={20} className="shrink-0" />
            ) : (
              <AlertCircle size={20} className="shrink-0" />
            )}
            <p className="text-sm font-medium">{audioUploadMessage}</p>
          </div>
        </div>
      )}
      {textUploadStatus !== "idle" && (
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] max-w-[380px] w-[calc(100%-3rem)] mx-auto px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl animate-fade-in-up ${
            textUploadStatus === "success"
              ? "bg-emerald-500/95 border-emerald-400 text-white"
              : "bg-red-500/95 border-red-400 text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            {textUploadStatus === "success" ? (
              <CheckCircle size={20} className="shrink-0" />
            ) : (
              <AlertCircle size={20} className="shrink-0" />
            )}
            <p className="text-sm font-medium">{textUploadMessage}</p>
          </div>
        </div>
      )}
      {imageUploadStatus !== "idle" && (
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] max-w-[380px] w-[calc(100%-3rem)] mx-auto px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl animate-fade-in-up ${
            imageUploadStatus === "success"
              ? "bg-emerald-500/95 border-emerald-400 text-white"
              : "bg-red-500/95 border-red-400 text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            {imageUploadStatus === "success" ? (
              <CheckCircle size={20} className="shrink-0" />
            ) : (
              <AlertCircle size={20} className="shrink-0" />
            )}
            <p className="text-sm font-medium">{imageUploadMessage}</p>
          </div>
        </div>
      )}

      {/* --- The Essence Section --- */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EBE5DA] shadow-sm mb-8 animate-fade-in-up">
        <p className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest mb-3 flex items-center gap-1">
          <Sparkles size={10} /> The Essence of Ah Kow
        </p>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Voice Upload */}
          <button
            onClick={handleButtonClick}
            disabled={uploadingAudio}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-left group relative overflow-hidden ${
              uploadingAudio
                ? "bg-amber-100 cursor-wait"
                : "bg-amber-50 hover:bg-amber-100"
            }`}
          >
            {uploadingAudio && (
              <div className="absolute inset-0 bg-amber-200/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 size={20} className="text-amber-600 animate-spin" />
              </div>
            )}
            <div className="w-9 h-9 rounded-full bg-white text-amber-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-amber-100">
              {uploadingAudio ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#3D2E22]">
                {uploadingAudio ? "Uploading..." : "His Voice"}
              </p>
              <p className="text-[10px] text-[#8C7B68]">
                {uploadingAudio
                  ? "Please wait"
                  : "Upload snippets of his voice"}
              </p>
            </div>
          </button>

          {/* Image Upload */}
          <button
            onClick={handleImageButtonClick}
            disabled={uploadingImage}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-left group relative overflow-hidden ${
              uploadingImage
                ? "bg-amber-100 cursor-wait"
                : "bg-amber-50 hover:bg-amber-100"
            }`}
          >
            {uploadingImage && (
              <div className="absolute inset-0 bg-amber-200/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 size={20} className="text-amber-600 animate-spin" />
              </div>
            )}
            <div className="w-9 h-9 rounded-full bg-white text-amber-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-amber-100">
              {uploadingImage ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Book size={16} />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#3D2E22]">
                {uploadingImage ? "Uploading..." : "In a glance"}
              </p>
              <p className="text-[10px] text-[#8C7B68]">
                {uploadingImage
                  ? "Please wait"
                  : "Upload snapshots"}
              </p>
            </div>
          </button>

          {/* Text Upload */}
          <button
            onClick={handleTextButtonClick}
            disabled={uploadingText}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-left group relative overflow-hidden ${
              uploadingText
                ? "bg-amber-100 cursor-wait"
                : "bg-amber-50 hover:bg-amber-100"
            }`}
          >
            {uploadingText && (
              <div className="absolute inset-0 bg-amber-200/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 size={20} className="text-amber-600 animate-spin" />
              </div>
            )}
            <div className="w-9 h-9 rounded-full bg-white text-amber-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-amber-100">
              {uploadingText ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#3D2E22]">
                {uploadingText ? "Uploading..." : "His Story"}
              </p>
              <p className="text-[10px] text-[#8C7B68]">
                {uploadingText ? "Please wait" : "Upload biography"}
              </p>
            </div>
          </button>
        </div>

        {/* Traits */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#F5F2EB] text-[#594A3C] text-[11px] font-medium border border-[#E6DCCF]">
            Family-First
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#F5F2EB] text-[#594A3C] text-[11px] font-medium border border-[#E6DCCF]">
            Adventurous
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#F5F2EB] text-[#594A3C] text-[11px] font-medium border border-[#E6DCCF]">
            Generous Soul
          </span>
        </div>
      </div>

      {/* --- Timeline Feed --- */}
      <div className="relative">
        <div className="absolute left-[22px] top-4 bottom-0 w-[2px] border-l-2 border-dashed border-stone-300" />

        {loadingArtifacts ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="text-amber-600 animate-spin mb-3" />
            <p className="text-sm text-[#8C7B68]">Loading memories...</p>
          </div>
        ) : (
          displayedArtifacts.map((item, idx) => (
            <div
              key={item.id || idx}
              className="relative pl-10 mb-10 animate-fade-in-up"
              // FIXED: Added backticks
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="absolute left-0 top-0 w-12 flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full border-2 border-white shadow-md z-10 ${
                    item.type === "audio"
                      ? "bg-orange-400"
                      : item.type === "photo"
                      ? "bg-indigo-500"
                      : item.type === "location" || item.type === "text"
                      ? "bg-emerald-500"
                      : item.type === "music"
                      ? "bg-indigo-500"
                      : "bg-stone-400"
                  }`}
                />
                <span className="mt-1 text-[9px] font-bold text-stone-400 rotate-90 origin-center translate-y-3">
                  {item.year}
                </span>
              </div>
              <div
                // FIXED: Added backticks and quotes
                className={`rounded-3xl p-5 shadow-lg transform transition-all hover:scale-[1.02] relative overflow-hidden ${item.color}`}
              >
                <div className="relative z-10">
                  <h3 className="font-serif text-lg text-[#3D2E22] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#594A3C] leading-relaxed mb-3 opacity-90">
                    {item.desc}
                  </p>
                  {/* Audio Content */}
                  {item.type === "audio" && (
                    <div className="bg-[#3D2E22] rounded-xl p-2.5 flex items-center gap-3 shadow-md">
                      <button
                        onClick={() => handlePlayAudio(item)}
                        className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        {currentPlayingId === item.id && isPlaying ? (
                          <Pause size={14} className="text-white" />
                        ) : (
                          <Play size={14} className="text-white ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-100"
                            style={{
                              width: `${
                                currentPlayingId === item.id ? audioProgress : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-[9px] text-orange-200 font-mono">
                        {currentPlayingId === item.id && currentTime > 0
                          ? `${formatTime(currentTime)} / ${formatTime(
                              audioDuration
                            )}`
                          : item.duration || "0:00"}
                      </span>
                    </div>
                  )}
                  {/* Photo Content */}
                  {item.type === "photo" && item.filePath && (
                    <div className="mt-3 rounded-xl overflow-hidden shadow-md">
                      <img
                        // FIXED: Added backticks for storage URL
                        src={`${
                          supabase.storage
                            .from("photos_upload")
                            .getPublicUrl(item.filePath).data.publicUrl
                        }`}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  {/* Text Content */}
                  {item.type === "text" && item.textContent && (
                    <div className="mt-3 bg-white/50 rounded-xl p-3 text-xs text-[#594A3C] leading-relaxed max-h-32 overflow-hidden relative">
                      <p className="line-clamp-4">
                        {item.textContent.substring(0, 200)}...
                      </p>
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/50 to-transparent" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="text-center pt-4 pb-20">
          <button
            onClick={loadMore}
            className="text-xs font-bold text-amber-600 border-b border-amber-600/30 hover:text-amber-800 transition-colors"
          >
            Load more memories...
          </button>
        </div>
      )}
    </div>
  );
};

// ------------------- 2. Echo (The Living Memory) -------------------
const EchoTab = () => {
  // State definitions
  const [status, setStatus] = useState("Idle");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [aiText, setAiText] = useState("I am listening...");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // 1. Init: Load voices
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        console.log("Voices loaded:", available.length);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 2. Logic: Keyword matching
  const processResponse = (text: string) => {
    const lowerText = text.toLowerCase();
    let response = "";

    console.log("Processing keywords:", lowerText);

    if (
      lowerText.includes("miss") ||
      lowerText.includes("mess") ||
      lowerText.includes("love") ||
      lowerText.includes("long")
    ) {
      response = "I know. I miss you too. But remember, I never really left.";
    } else if (
      lowerText.includes("hello") ||
      lowerText.includes("hi") ||
      lowerText.includes("hey")
    ) {
      response = "Hello. It is so good to hear your voice again.";
    } else if (
      lowerText.includes("remember") ||
      lowerText.includes("memory") ||
      lowerText.includes("past")
    ) {
      response = "I remember everything. Especially the sound of your laughter.";
    } else if (lowerText.includes("bye") || lowerText.includes("see you")) {
      response = "Goodbye for now. I will be right here.";
    } else if (
      lowerText.includes("weather") ||
      lowerText.includes("rain") ||
      lowerText.includes("hot")
    ) {
      response =
        "Do not worry about the weather. Focus on the warmth in your heart.";
    } else {
      response = "I am listening. Tell me more about your day.";
    }

    setAiText(response);
    speak(response);
  };

  // 3. TTS
  const speak = (text: string) => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support speech synthesis");
      return;
    }

    window.speechSynthesis.cancel();
    setStatus("Speaking...");

    const utterance = new SpeechSynthesisUtterance(text);

    const preferredVoice =
      voices.find((v) => v.name.includes("Google US English")) ||
      voices.find((v) => v.name.includes("David")) ||
      voices.find((v) => v.lang.includes("en") && v.name.includes("Male")) ||
      voices.find((v) => v.lang.includes("en")) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log("Using voice:", preferredVoice.name);
    }

    utterance.rate = 0.85;
    utterance.pitch = 0.9;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setStatus("Idle");
    };

    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      setStatus("TTS Error");
    };

    window.speechSynthesis.speak(utterance);
  };

  // 4. STT
  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition =
      // @ts-ignore
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("This feature only supports Chrome Desktop or Android Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
      setUserTranscript("");
      window.speechSynthesis.cancel();
    };

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;

      console.log("Recognition result:", text);
      setUserTranscript(text);

      setStatus("Thinking...");
      setTimeout(() => {
        processResponse(text);
      }, 600);
    };

    recognition.onerror = (event: any) => {
      console.error("Recognition error:", event.error);
      setStatus("Microphone Error: " + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!window.speechSynthesis.speaking) setStatus("Idle");
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Cannot start recording:", e);
      setStatus("Mic Busy? Try again.");
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] relative overflow-hidden bg-black transition-all duration-1000">
      <div
        className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
          isSpeaking ? "scale-110 opacity-100" : "scale-100 opacity-60"
        }`}
      >
        <img
          src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-8 z-20 pb-20">
        {/* User Transcript Debug */}
        <div className="mb-6 text-center min-h-[24px]">
          {userTranscript && (
            <span className="text-white/80 text-sm font-medium animate-fade-in-up bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
              You said: "{userTranscript}"
            </span>
          )}
        </div>

        {/* AI Response Subtitles */}
        <div
          className={`transition-all duration-1000 transform mb-8 ${
            isSpeaking ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <p className="text-amber-100 text-2xl font-serif font-medium leading-relaxed text-center drop-shadow-2xl px-4">
            "{aiText}"
          </p>
        </div>

        {/* Listening Animation */}
        {isListening && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-none">
            <div className="flex gap-1.5 h-10 items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1.5 bg-amber-400 rounded-full animate-bounce"
                  // FIXED: Added backticks
                  style={{
                    height: `${Math.random() * 30 + 10}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <p className="text-amber-400 font-bold tracking-widest text-xs uppercase shadow-black drop-shadow-md">
              Listening...
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 mt-2">
          <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/40 border border-white/10 hover:bg-white/20 transition-all">
            <Volume2 size={20} />
          </button>

          <button
            onClick={startListening}
            disabled={isSpeaking || isListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-4 ${
              isListening
                ? "bg-red-500 border-red-400 ring-4 ring-red-500/20"
                : isSpeaking
                ? "bg-amber-600 border-amber-500 ring-4 ring-amber-600/20 opacity-90 cursor-default"
                : "bg-emerald-500 border-emerald-400 ring-4 ring-emerald-500/20 animate-pulse-slow cursor-pointer"
            }`}
          >
            {isListening ? (
              <Video size={32} className="animate-pulse" />
            ) : (
              <Mic size={32} />
            )}
          </button>

          <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/40 border border-white/10 hover:bg-white/20 transition-all">
            <MessageCircle size={20} />
          </button>
        </div>

        {/* Debug Status */}
        <p className="text-center text-[10px] text-white/30 mt-6 uppercase tracking-widest font-mono">
          System Status: {status}
        </p>
      </div>
    </div>
  );
};

// ------------------- 3. Vault (Targeted Messages) -------------------
const VaultTab = () => {
  const [unlockingId, setUnlockingId] = useState<number | null>(null);

  const letters = [
    {
      id: 1,
      label: "For Sarah's Wedding",
      recipient: "Sarah",
      unlockDate: "Locked",
      icon: Lock,
      status: "locked",
      bg: "bg-stone-800",
    },
    {
      id: 2,
      label: "Open when you feel lost",
      recipient: "Anyone",
      unlockDate: "Available",
      icon: Key,
      status: "unlocked",
      bg: "bg-[#3D2E22]",
    },
    {
      id: 3,
      label: "For John (21st Birthday)",
      recipient: "John",
      unlockDate: "Oct 24, 2028",
      icon: Clock,
      status: "locked",
      bg: "bg-stone-800",
    },
  ];

  const handleUnlock = (id: number) => {
    setUnlockingId(id);
    setTimeout(() => {
      alert("Identity Verified: Content Unlocked");
      setUnlockingId(null);
    }, 1000);
  };

  return (
    <div className="px-6 pt-8 pb-20 min-h-screen bg-[#1c1917] relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
      <div className="relative z-10 text-center mb-8">
        <h2 className="font-serif text-2xl text-[#E7E5E4] mb-2">
          The Time Vault
        </h2>
        <p className="text-xs text-stone-400 max-w-xs mx-auto">
          Messages sealed in time for specific loved ones.
        </p>
      </div>
      <div className="grid gap-4 relative z-10 pb-20">
        {letters.map((letter) => (
          <div
            key={letter.id}
            className={`relative p-1 rounded-2xl ${
              letter.status === "unlocked"
                ? "bg-gradient-to-r from-amber-200 to-yellow-500"
                : "bg-stone-700"
            }`}
          >
            <div
              // FIXED: Added backticks for template literal
              className={`h-full rounded-xl p-5 flex items-center gap-4 ${letter.bg} relative overflow-hidden`}
            >
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${
                  letter.status === "unlocked"
                    ? "bg-amber-500 border-amber-300 text-white"
                    : "bg-stone-700 border-stone-600 text-stone-500"
                }`}
              >
                <letter.icon size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    To: {letter.recipient}
                  </span>
                </div>
                <h3
                  className={`font-serif text-lg leading-tight mb-1 ${
                    letter.status === "unlocked"
                      ? "text-amber-100"
                      : "text-stone-400"
                  }`}
                >
                  {letter.label}
                </h3>
                <p
                  className={`text-[10px] uppercase tracking-wider font-bold ${
                    letter.status === "unlocked"
                      ? "text-amber-400"
                      : "text-stone-600"
                  }`}
                >
                  {letter.unlockDate}
                </p>
              </div>
              {letter.status === "locked" && (
                <button
                  onClick={() => handleUnlock(letter.id)}
                  className="absolute inset-0 w-full h-full cursor-pointer z-20 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity backdrop-blur-sm"
                >
                  <span className="text-xs font-bold text-white border border-white/50 px-3 py-1 rounded-full">
                    {unlockingId === letter.id
                      ? "Verifying..."
                      : "Verify Identity"}
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------- 4. Letters (Healing Words) -------------------
const LettersTab = () => {
  const [mode, setMode] = useState<"list" | "write-him" | "write-self">(
    "list"
  );
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!text) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setMode("list");
      setText("");
      alert(
        mode === "write-him"
          ? "Letter sent to the stars."
          : "Letter sealed for the future."
      );
    }, 1500);
  };

  if (mode === "list") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] px-6 py-8 relative flex flex-col">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl text-[#3D2E22] mb-3">
            Words Unsaid
          </h2>
          <p className="text-sm text-[#8C7B68] font-light leading-relaxed max-w-xs mx-auto">
            A quiet place to whisper what you didn't get to say, or to leave a
            promise for yourself.
          </p>
        </div>

        <div className="grid gap-5">
          <button
            onClick={() => setMode("write-him")}
            className="group relative overflow-hidden bg-white border border-[#EBE5DA] p-6 rounded-[24px] shadow-sm hover:shadow-lg transition-all text-left"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Mail size={64} className="text-amber-500" />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <PenLine size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#3D2E22] mb-1">
                  Letters to Him
                </h3>
                <p className="text-xs text-[#8C7B68] leading-relaxed">
                  "I miss you," "I'm sorry," or "Thank you." Send a message to
                  the stars.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode("write-self")}
            className="group relative overflow-hidden bg-[#3D2E22] text-white p-6 rounded-[24px] shadow-lg shadow-amber-900/10 text-left"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock size={64} className="text-white" />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-100 shrink-0 backdrop-blur-md">
                <CalendarHeart size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#FFF8EE] mb-1">
                  To Future Me
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Write a letter to yourself on his next anniversary. A reminder
                  of love and healing.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative">
      <div className="flex-1 px-6 py-8 flex flex-col">
        <button
          onClick={() => setMode("list")}
          className="self-start flex items-center gap-2 text-[#8C7B68] hover:text-[#3D2E22] mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex-1 flex flex-col">
          <h2 className="font-serif text-2xl text-[#3D2E22] mb-2">
            {mode === "write-him" ? "Dear Grandpa Lim," : "Dear Future Me,"}
          </h2>
          <p className="text-xs text-[#8C7B68] mb-6">
            {mode === "write-him"
              ? "Pour your heart out. No one else has to see this unless you choose."
              : "This will be unlocked and sent to you on Dec 20, 2026."}
          </p>

          <div className="flex-1 bg-white border border-[#EBE5DA] rounded-[20px] p-6 shadow-sm relative mb-6 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
            <div
              className="absolute inset-0 pointer-events-none opacity-5"
              style={{
                backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
                backgroundSize: "100% 2rem",
                backgroundPositionY: "2rem",
              }}
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-full bg-transparent border-none outline-none resize-none text-[#3D2E22] text-lg font-serif leading-[2rem] placeholder:text-stone-300 placeholder:italic"
              placeholder="Start writing here..."
              autoFocus
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!text || isSending}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all ${
              isSending
                ? "bg-stone-300 cursor-not-allowed"
                : "bg-[#3D2E22] hover:bg-[#2A2018] active:scale-[0.98]"
            }`}
          >
            {isSending ? (
              <Sparkles size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {isSending
              ? "Sealing Letter..."
              : mode === "write-him"
              ? "Send to Heaven"
              : "Seal for Future"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ------------------- MAIN COMPONENT -------------------

export default function Capsule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("timeline");
  const [scrolled, setScrolled] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getBgColor = () => {
    if (activeTab === "timeline") return "bg-[#FDFBF7]";
    if (activeTab === "vault") return "bg-[#1c1917]";
    if (activeTab === "letters") return "bg-[#FDFBF7]";
    return "bg-black"; // Echo
  };

  return (
    // FIXED: Added backticks
    <div
      className={`min-h-screen flex justify-center ${getBgColor()} transition-colors duration-700`}
    >
      <div
        // FIXED: Added backticks
        className={`w-full max-w-[430px] min-h-screen relative flex flex-col shadow-2xl transition-colors duration-700 ${getBgColor()}`}
      >
        {/* Sticky Header */}
        <header
          className={`fixed top-0 w-full max-w-[430px] z-50 transition-all duration-500 px-6 flex items-center justify-between ${
            scrolled
              ? (activeTab === "timeline" || activeTab === "letters"
                  ? "bg-[#FDFBF7]/90 py-3"
                  : "bg-black/80 py-3") + " backdrop-blur-xl shadow-sm"
              : "bg-transparent py-6"
          }`}
        >
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === "echo" || activeTab === "vault"
                ? "bg-white/10 text-white border border-white/20"
                : scrolled
                ? "bg-white border border-[#EBE5DA] text-[#3D2E22]"
                : "bg-black/20 backdrop-blur-md text-white border border-white/20"
            }`}
          >
            <ArrowLeft size={20} />
          </button>

          <div
            className={`transition-all duration-500 transform ${
              scrolled
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <span
              className={`font-serif text-lg font-bold leading-none ${
                activeTab === "echo" || activeTab === "vault"
                  ? "text-white"
                  : "text-[#3D2E22]"
              }`}
            >
              Lim Ah Kow
            </span>
          </div>

          <button
            onClick={() => setShowShare(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === "echo" || activeTab === "vault"
                ? "bg-white/10 text-white border border-white/20"
                : scrolled
                ? "bg-white border border-[#EBE5DA] text-[#3D2E22]"
                : "bg-black/20 backdrop-blur-md text-white border border-white/20"
            }`}
          >
            <Share2 size={18} />
          </button>
        </header>

        {/* Share Modal */}
        {showShare && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setShowShare(false)}
            />
            <div className="relative bg-white w-full max-w-[380px] rounded-[32px] p-6 shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-[#3D2E22]">
                  Share Memory
                </h3>
                <button
                  onClick={() => setShowShare(false)}
                  className="p-2 hover:bg-stone-100 rounded-full"
                >
                  <X size={20} className="text-stone-500" />
                </button>
              </div>
              <div className="flex flex-col items-center mb-8">
                <div className="w-48 h-48 bg-white border-2 border-amber-100 rounded-2xl p-2 shadow-sm mb-4">
                  <img
                    // FIXED: Added backticks
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://vlinks.app/capsule/lim-ah-kow&color=3D2E22&bgcolor=FFFFFF`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <p className="text-xs text-stone-500 text-center px-4 leading-relaxed">
                  Scan to visit <b>Lim Ah Kow's</b> memorial directly.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-2">
                <button className="flex flex-col items-center gap-2 group">
                  <div className="w-12 h-12 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#3D2E22] group-hover:bg-[#3D2E22] group-hover:text-white transition-colors">
                    <Link size={20} />
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium group-hover:text-[#3D2E22]">
                    Copy
                  </span>
                </button>
                <button className="flex flex-col items-center gap-2 group">
                  <div className="w-12 h-12 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#3D2E22] group-hover:bg-[#E1306C] group-hover:text-white transition-colors">
                    <Instagram size={20} />
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium group-hover:text-[#E1306C]">
                    Story
                  </span>
                </button>
                <button className="flex flex-col items-center gap-2 group">
                  <div className="w-12 h-12 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#3D2E22] group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                    <Facebook size={20} />
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium group-hover:text-[#1877F2]">
                    Facebook
                  </span>
                </button>
                <button className="flex flex-col items-center gap-2 group">
                  <div className="w-12 h-12 rounded-full bg-[#F5F2EB] flex items-center justify-center text-[#3D2E22] group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Download size={20} />
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium group-hover:text-amber-500">
                    Save QR
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Area (Timeline Only) */}
        {activeTab === "timeline" ? (
          <div className="relative w-full h-[420px] shrink-0 overflow-hidden">
            <img
              src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              className="w-full h-full object-cover animate-fade-in scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/40 to-black/30" />
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-20 text-center flex flex-col items-center animate-fade-in-up">
              <h1 className="font-serif text-5xl text-[#3D2E22] mb-2 drop-shadow-sm">
                Lim Ah Kow
              </h1>
              <p className="text-sm text-[#594A3C] font-medium tracking-wide mb-3 opacity-80">
                1930 – 2023 • Singapore
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 backdrop-blur border border-white/40 text-[10px] text-[#3D2E22] font-bold uppercase tracking-wider shadow-sm">
                <Sparkles size={10} className="text-amber-500" /> Forever Loved
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[150px] shrink-0" />
        )}

        {/* Sticky Tabs */}
        <div
          className={`sticky z-40 px-6 pt-2 transition-all duration-500 ${
            activeTab !== "timeline" ? "top-[75px]" : "top-[68px] -mt-12"
          }`}
        >
          <div
            className={`flex p-1.5 rounded-2xl shadow-lg border backdrop-blur-md overflow-x-auto no-scrollbar ${
              activeTab === "echo" || activeTab === "vault"
                ? "bg-white/10 border-white/10 shadow-black/20"
                : "bg-white/80 border-[#EBE5DA] shadow-stone-200/50"
            }`}
          >
            {(["timeline", "echo", "vault", "letters"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[70px] py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === tab
                    ? activeTab === "echo" || activeTab === "vault"
                      ? "bg-white text-black shadow-md"
                      : "bg-[#3D2E22] text-white shadow-md"
                    : activeTab === "echo" || activeTab === "vault"
                    ? "text-white/60 hover:bg-white/10"
                    : "text-[#8C7B68] hover:bg-[#F9F6F0]"
                }`}
              >
                {tab === "timeline" && (
                  <>
                    <Map size={14} /> Life
                  </>
                )}
                {tab === "echo" && (
                  <>
                    <MessageCircle size={14} /> Echo
                  </>
                )}
                {tab === "vault" && (
                  <>
                    <Lock size={14} /> Vault
                  </>
                )}
                {tab === "letters" && (
                  <>
                    <PenLine size={14} /> Letters
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 pb-0 min-h-[400px]">
          {activeTab === "timeline" && <TimelineTab />}
          {activeTab === "echo" && <EchoTab />}
          {activeTab === "vault" && <VaultTab />}
          {activeTab === "letters" && <LettersTab />}
        </div>
      </div>
    </div>
  );
}