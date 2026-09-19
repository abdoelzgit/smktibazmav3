"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getBeritaByIdAction, updateBeritaAction } from "@/app/actions/berita";
import { uploadFileAction } from "@/app/actions/upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Type,
  ImageIcon,
  Plus,
  Upload,
  Heading2,
  Trash2,
  MoveUp,
  MoveDown,
  Settings2,
  Eye,
  Save,
  FolderOpen,
  Check,
  Loader2,
} from "lucide-react";

type BlockType = "paragraph" | "heading" | "image";

interface Block {
  id: string;
  type: BlockType;
  content: string;
  imageSrc?: string;
  caption?: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const CATEGORIES = [
  "Akademik",
  "Pengumuman",
  "Kegiatan Sekolah",
  "Prestasi",
  "Asrama",
  "Teknologi",
];

export default function EditBeritaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const beritaId = resolvedParams.id;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [category, setCategory] = useState("Akademik");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [sidebarTab, setSidebarTab] = useState<"blocks" | "settings">("blocks");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [blocks, setBlocks] = useState<Block[]>([
    { id: uid(), type: "paragraph", content: "" },
  ]);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadBerita() {
      try {
        const result = await getBeritaByIdAction(beritaId);
        if (result.success && result.data) {
          const b = result.data as {
            title: string;
            excerpt: string | null;
            category: string;
            coverImage: string | null;
            content: string;
            published: boolean;
          };
          setTitle(b.title);
          setExcerpt(b.excerpt || "");
          setCategory(b.category || "Akademik");
          setCoverSrc(b.coverImage || null);
          setStatus(b.published ? "published" : "draft");
          try {
            const parsed: Block[] = JSON.parse(b.content || "[]");
            if (parsed.length > 0) {
              setBlocks(parsed);
            }
          } catch {
            // ignore JSON parse error
          }
        } else {
          setSaveMessage(result.error || "Gagal memuat data berita");
        }
      } catch {
        setSaveMessage("Gagal memuat data berita");
      } finally {
        setIsLoading(false);
      }
    }
    loadBerita();
  }, [beritaId]);

  const addBlock = (type: BlockType) => {
    setBlocks((prev) => [...prev, { id: uid(), type, content: "" }]);
  };

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBlocks(updated);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadFileAction(formData);
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

  const handleSaveChange = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const result = await updateBeritaAction(beritaId, {
      title,
      excerpt,
      category,
      coverSrc,
      blocks,
      status,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSaveMessage("Perubahan berhasil disimpan");
      setTimeout(() => {
        router.push("/admin/berita");
      }, 1000);
    } else {
      setSaveMessage(result.error || "Gagal menyimpan perubahan");
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <span className="text-muted-foreground text-lg">Memuat berita...</span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6 transition-all">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/berita"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>

          <Separator orientation="vertical" className="h-5 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Berita
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Edit Perubahan
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
              isPreviewMode && "bg-muted text-foreground",
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {isPreviewMode ? "Edit" : "Pratinjau"}
            </span>
          </Button>

          <Button
            size="sm"
            onClick={handleSaveChange}
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
              sidebarOpen && "bg-muted text-foreground",
            )}
            title="Panel Pengaturan & Blok"
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
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight font-heading leading-tight">
                    {title || "Judul Berita"}
                  </h1>
                  {excerpt && (
                    <p className="text-lg text-muted-foreground leading-relaxed italic">
                      {excerpt}
                    </p>
                  )}
                </div>

                {coverSrc && (
                  <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                    <img
                      src={coverSrc}
                      alt="Cover Berita"
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                )}

                <div className="prose prose-slate dark:prose-invert max-w-none pt-4 space-y-4">
                  {blocks.map((block) => (
                    <div key={block.id}>
                      {block.type === "heading" && (
                        <h2 className="text-xl md:text-2xl font-bold text-foreground font-heading mt-6 mb-2">
                          {block.content || "Sub-judul..."}
                        </h2>
                      )}
                      {block.type === "paragraph" && (
                        <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {block.content || "Teks paragraf..."}
                        </p>
                      )}
                      {block.type === "image" && block.imageSrc && (
                        <figure className="my-6 space-y-2">
                          <img
                            src={block.imageSrc}
                            alt="Konten Berita"
                            className="rounded-xl w-full max-h-[450px] object-cover border border-border"
                          />
                          {block.caption && (
                            <figcaption className="text-center text-xs text-muted-foreground">
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Beri Judul Berita..."
                    className="border-none bg-transparent px-0 text-3xl md:text-4xl font-extrabold text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 font-heading h-auto shadow-none tracking-tight"
                  />
                  <Textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Tulis ringkasan singkat berita ini (opsional)..."
                    className="border-none bg-transparent px-0 text-base md:text-lg text-muted-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[50px] shadow-none"
                  />
                </div>

                <div
                  onClick={() => !isUploadingCover && coverRef.current?.click()}
                  className={cn(
                    "group relative w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200",
                    coverSrc
                      ? "border-transparent bg-muted/30 shadow-sm"
                      : "border-border bg-card hover:border-primary/50 hover:bg-muted/40",
                  )}
                >
                  {isUploadingCover ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                      <p className="text-xs text-muted-foreground font-medium">
                        Mengunggah gambar ke server...
                      </p>
                    </div>
                  ) : coverSrc ? (
                    <div className="relative aspect-video w-full overflow-hidden">
                      <img
                        src={coverSrc}
                        alt="Gambar cover berita"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-xs">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-white bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-md">
                          <Upload className="h-4 w-4" /> Ganti Gambar Cover
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                        <Upload className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Unggah Gambar Cover
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Tarik gambar atau klik di sini (PNG, JPG, WebP — maks. 5 MB)
                      </p>
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
                  {blocks.map((block, index) => (
                    <BlockRow
                      key={block.id}
                      block={block}
                      index={index}
                      totalBlocks={blocks.length}
                      onUpdate={(patch) => updateBlock(block.id, patch)}
                      onRemove={() => removeBlock(block.id)}
                      onMove={(dir) => moveBlock(index, dir)}
                    />
                  ))}
                </div>

                <div className="pt-6 pb-12 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-muted-foreground mr-2 font-medium">
                    Tambah blok:
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => addBlock("paragraph")}
                    className="gap-1.5 rounded-full hover:border-primary/50 hover:text-primary"
                  >
                    <Type className="h-3.5 w-3.5" /> Paragraf
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => addBlock("heading")}
                    className="gap-1.5 rounded-full hover:border-primary/50 hover:text-primary"
                  >
                    <Heading2 className="h-3.5 w-3.5" /> Sub-judul
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => addBlock("image")}
                    className="gap-1.5 rounded-full hover:border-primary/50 hover:text-primary"
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> Gambar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        {sidebarOpen && (
          <aside className="w-80 shrink-0 border-l border-border bg-card/60 backdrop-blur-sm flex flex-col transition-all duration-300 h-full overflow-hidden">
            <div className="flex border-b border-border p-1 bg-muted/40 shrink-0">
              <button
                onClick={() => setSidebarTab("blocks")}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5",
                  sidebarTab === "blocks"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Plus className="h-3.5 w-3.5" /> Sisipkan Blok
              </button>
              <button
                onClick={() => setSidebarTab("settings")}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5",
                  sidebarTab === "settings"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Settings2 className="h-3.5 w-3.5" /> Pengaturan
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-4 space-y-5">
              {sidebarTab === "blocks" ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Pilih Jenis Konten
                  </p>
                  <SidebarBlockItem
                    icon={<Type className="h-4 w-4" />}
                    title="Paragraf Teks"
                    desc="Tambahkan teks paragraf standar"
                    onClick={() => addBlock("paragraph")}
                  />
                  <SidebarBlockItem
                    icon={<Heading2 className="h-4 w-4" />}
                    title="Sub-judul (H2)"
                    desc="Bagian judul kecil untuk menstrukturkan artikel"
                    onClick={() => addBlock("heading")}
                  />
                  <SidebarBlockItem
                    icon={<ImageIcon className="h-4 w-4" />}
                    title="Gambar Konten"
                    desc="Unggah gambar dengan keterangan"
                    onClick={() => addBlock("image")}
                  />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FolderOpen className="h-3.5 w-3.5 text-primary" /> Kategori Berita
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
                              : "border-border bg-background text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">Status Publikasi</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setStatus("draft")}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-medium text-center border transition-all",
                          status === "draft"
                            ? "border-amber-500 bg-amber-500/10 text-amber-600 font-semibold"
                            : "border-border bg-background text-muted-foreground hover:bg-muted",
                        )}
                      >
                        Draft
                      </button>
                      <button
                        onClick={() => setStatus("published")}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-medium text-center border transition-all",
                          status === "published"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 font-semibold"
                            : "border-border bg-background text-muted-foreground hover:text-muted",
                        )}
                      >
                        Dipublikasikan
                      </button>
                    </div>
                  </div>

                  <Separator />

                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Jumlah Blok</span>
                      <span className="font-semibold text-foreground">
                        {blocks.length} blok
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function BlockRow({
  block,
  index,
  totalBlocks,
  onUpdate,
  onRemove,
  onMove,
}: {
  block: Block;
  index: number;
  totalBlocks: number;
  onUpdate: (patch: Partial<Block>) => void;
  onRemove: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const imageRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadFileAction(formData);
      if (result.success && result.data?.url) {
        onUpdate({ imageSrc: result.data.url });
      } else {
        alert(result.error || "Gagal mengunggah gambar");
      }
    } catch (err) {
      console.error("Block image upload error:", err);
      alert("Terjadi kesalahan saat mengunggah gambar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="group relative rounded-xl border border-transparent p-2 transition-all hover:border-border hover:bg-card/60">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-xs border border-border p-0.5 rounded-lg shadow-xs">
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={index === 0}
          onClick={() => onMove("up")}
          className="text-muted-foreground hover:text-foreground"
          title="Pindah ke atas"
        >
          <MoveUp className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={index === totalBlocks - 1}
          onClick={() => onMove("down")}
          className="text-muted-foreground hover:text-foreground"
          title="Pindah ke bawah"
        >
          <MoveDown className="h-3 w-3" />
        </Button>
        <Separator orientation="vertical" className="h-3" />
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          className="text-destructive hover:bg-destructive/10"
          title="Hapus blok"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {block.type === "paragraph" && (
        <Textarea
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Tulis paragraf di sini..."
          className="min-h-[90px] border-none bg-transparent p-1 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-0 resize-none shadow-none"
        />
      )}

      {block.type === "heading" && (
        <Input
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Sub-judul (H2)..."
          className="border-none bg-transparent p-1 text-xl md:text-2xl font-bold text-foreground font-heading placeholder:text-muted-foreground/30 focus-visible:ring-0 shadow-none"
        />
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <div
            onClick={() => !isUploading && imageRef.current?.click()}
            className={cn(
              "group/img relative w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground",
              block.imageSrc
                ? "border-transparent bg-muted/20 p-0"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            {isUploading ? (
              <div className="py-6 flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <span className="text-xs font-medium">Mengunggah gambar...</span>
              </div>
            ) : block.imageSrc ? (
              <div className="relative aspect-video w-full">
                <img
                  src={block.imageSrc}
                  alt="Gambar Konten"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl">
                  <span className="text-xs font-medium text-white bg-black/50 px-3 py-1.5 rounded-full border border-white/20">
                    Ganti Gambar
                  </span>
                </div>
              </div>
            ) : (
              <>
                <ImageIcon className="h-6 w-6 text-primary/70" />
                <span className="text-xs font-medium">
                  Klik untuk unggah gambar konten
                </span>
              </>
            )}
          </div>
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          {block.imageSrc && (
            <Input
              value={block.caption || ""}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              placeholder="Tambahkan keterangan gambar (opsional)..."
              className="h-7 text-xs border-none bg-transparent text-center text-muted-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0"
            />
          )}
        </div>
      )}
    </div>
  );
}

function SidebarBlockItem({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-2.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/30 transition-all text-left group"
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h4>
        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
          {desc}
        </p>
      </div>
    </button>
  );
}
