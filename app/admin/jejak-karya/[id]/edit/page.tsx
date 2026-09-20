"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getJejakKaryaByIdAction, updateJejakKaryaAction } from "@/app/actions/jejak-karya";
import { uploadFileAction } from "@/app/actions/upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Upload,
  Settings2,
  Eye,
  Save,
  FolderOpen,
  Check,
  X,
  Plus,
} from "lucide-react";

const CATEGORIES = ["Website", "Design", "Video", "IoT"];

export default function EditJejakKaryaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const karyaId = resolvedParams.id;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Website");
  const [year, setYear] = useState("2026");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [challenge, setChallenge] = useState("");
  const [approach, setApproach] = useState("");
  const [outcome, setOutcome] = useState("");
  const [whatWeDid, setWhatWeDid] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getJejakKaryaByIdAction(karyaId);
        if (result.success && result.data) {
          const data = result.data as any;
          setTitle(data.title);
          setCategory(data.category || "Website");
          setYear(data.year || "2026");
          setAuthor(data.author);
          setDescription(data.description);
          setChallenge(data.challenge || "");
          setApproach(data.approach || "");
          setOutcome(data.outcome || "");
          setWhatWeDid(data.whatWeDid || "");
          setDemoUrl(data.demoUrl || "");
          setCoverSrc(data.coverImage || null);
          setStatus(data.published ? "published" : "draft");

          try {
            const parsedTags = data.tags ? JSON.parse(data.tags) : [];
            setTags(parsedTags);
          } catch {
            setTags([]);
          }

          try {
            const parsedGallery = data.galleryImages ? JSON.parse(data.galleryImages) : [];
            setGalleryImages(parsedGallery);
          } catch {
            setGalleryImages([]);
          }
        } else {
          setSaveMessage(result.error || "Gagal memuat data");
        }
      } catch {
        setSaveMessage("Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [karyaId]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "jejak-karya");

      const result = await uploadFileAction(formData, "jejak-karya");
      if (result.success && result.data?.url) {
        setCoverSrc(result.data.url);
      } else {
        alert(result.error || "Gagal mengunggah gambar cover");
      }
    } catch (err) {
      console.error("Cover upload error:", err);
      alert("Terjadi kesalahan saat mengunggah gambar cover");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploadingGallery(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "jejak-karya");

        const result = await uploadFileAction(formData, "jejak-karya");
        if (result.success && result.data?.url) {
          setGalleryImages((prev) => [...prev, result.data!.url]);
        }
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert("Terjadi kesalahan saat mengunggah galeri");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSaveChanges = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const result = await updateJejakKaryaAction(karyaId, {
      title,
      category,
      year,
      author,
      description,
      challenge,
      approach,
      outcome,
      whatWeDid,
      tags,
      coverImage: coverSrc || undefined,
      galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
      demoUrl: demoUrl || undefined,
      published: status === "published",
    });

    setIsSubmitting(false);

    if (result.success) {
      setSaveMessage("Perubahan berhasil disimpan");
      setTimeout(() => {
        router.push("/admin/jejak-karya");
      }, 1000);
    } else {
      setSaveMessage(result.error || "Gagal menyimpan perubahan");
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <span className="text-muted-foreground text-lg">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6 transition-all">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/jejak-karya"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>

          <Separator orientation="vertical" className="h-5 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jejak Karya
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Edit
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveMessage && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2.5 py-1 bg-emerald-500/10 rounded-full animate-in fade-in">
              <Check className="h-3.5 w-3.5" />
              {saveMessage}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={cn(
              "gap-1.5 text-xs font-medium",
              isPreviewMode && "bg-muted text-foreground"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {isPreviewMode ? "Edit" : "Pratinjau"}
            </span>
          </Button>

          <Button
            size="sm"
            onClick={handleSaveChanges}
            disabled={isSubmitting}
            className="gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              "Menyimpan..."
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </Button>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              sidebarOpen && "bg-muted text-foreground"
            )}
            title="Panel Pengaturan"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-12 md:py-10">
          <div className="mx-auto max-w-3xl">
            {isPreviewMode ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {category}
                    </span>
                    <span className="text-xs text-muted-foreground">{year}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight font-heading leading-tight">
                    {title}
                  </h1>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                  <p className="text-sm text-muted-foreground italic">Oleh {author}</p>
                </div>

                {coverSrc && (
                  <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                    <img
                      src={coverSrc}
                      alt="Cover"
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                )}

                {galleryImages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Galeri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {galleryImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full aspect-video object-cover rounded-xl border border-border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {(challenge || approach || outcome || whatWeDid) && (
                  <div className="space-y-6 pt-6 border-t border-border">
                    {challenge && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-foreground">Tantangan</h3>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {challenge}
                        </p>
                      </div>
                    )}
                    {approach && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-foreground">Pendekatan</h3>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {approach}
                        </p>
                      </div>
                    )}
                    {outcome && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-foreground">Hasil</h3>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {outcome}
                        </p>
                      </div>
                    )}
                    {whatWeDid && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-foreground">Yang Kami Lakukan</h3>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {whatWeDid}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Judul Jejak Karya..."
                    className="border-none bg-transparent px-0 text-3xl md:text-4xl font-extrabold text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 font-heading h-auto shadow-none tracking-tight"
                  />

                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi ringkas..."
                    className="border-none bg-transparent px-0 text-base md:text-lg text-muted-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[50px] shadow-none"
                  />
                </div>

                <div
                  onClick={() => !isUploadingCover && coverRef.current?.click()}
                  className={cn(
                    "group relative w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200",
                    coverSrc
                      ? "border-transparent bg-muted/30 shadow-sm"
                      : "border-border bg-card hover:border-primary/50 hover:bg-muted/40"
                  )}
                >
                  {coverSrc ? (
                    <div className="relative aspect-video w-full overflow-hidden">
                      <img
                        src={coverSrc}
                        alt="Cover"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-xs">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-white bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-md">
                          <Upload className="h-4 w-4" /> Ganti Cover
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                        <Upload className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {isUploadingCover ? "Mengunggah..." : "Unggah Cover"}
                      </h3>
                    </div>
                  )}
                </div>
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />

                <Separator className="my-4" />

                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Tantangan</Label>
                  <Textarea
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    placeholder="Jelaskan tantangan..."
                    className="min-h-[100px] border-border focus-visible:ring-1"
                  />

                  <Label className="text-sm font-semibold">Pendekatan</Label>
                  <Textarea
                    value={approach}
                    onChange={(e) => setApproach(e.target.value)}
                    placeholder="Jelaskan pendekatan..."
                    className="min-h-[100px] border-border focus-visible:ring-1"
                  />

                  <Label className="text-sm font-semibold">Hasil</Label>
                  <Textarea
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    placeholder="Jelaskan hasil..."
                    className="min-h-[100px] border-border focus-visible:ring-1"
                  />

                  <Label className="text-sm font-semibold">Yang Kami Lakukan</Label>
                  <Textarea
                    value={whatWeDid}
                    onChange={(e) => setWhatWeDid(e.target.value)}
                    placeholder="Jelaskan peran tim..."
                    className="min-h-[100px] border-border focus-visible:ring-1"
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Galeri Gambar</Label>
                  <Button
                    variant="outline"
                    onClick={() => galleryRef.current?.click()}
                    disabled={isUploadingGallery}
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploadingGallery ? "Mengunggah..." : "Tambah Gambar Galeri"}
                  </Button>
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryUpload}
                  />

                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {galleryImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full aspect-video object-cover rounded-lg border border-border"
                          />
                          <button
                            onClick={() =>
                              setGalleryImages((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {sidebarOpen && (
          <aside className="w-80 shrink-0 border-l border-border bg-card/60 backdrop-blur-sm flex flex-col transition-all duration-300 h-full overflow-y-auto p-4 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5 text-primary" /> Kategori
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-medium text-left border transition-all truncate",
                      category === cat
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">Status</Label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setStatus("draft")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    status === "draft"
                      ? "border-amber-500 bg-amber-500/10 text-amber-600 font-semibold"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  Draft
                </button>
                <button
                  onClick={() => setStatus("published")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    status === "published"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 font-semibold"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  Dipublikasikan
                </button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">Tahun</Label>
              <Input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                type="text"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">Penulis/Tim</Label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Nama tim..."
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">Demo URL</Label>
              <Input
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                className="h-8 text-xs"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">Tag/Teknologi</Label>
              <div className="flex gap-1.5">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Tambah tag..."
                  className="h-8 text-xs flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddTag}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full border border-primary/20"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-primary/60"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
