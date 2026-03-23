"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type PdfItemActionsProps = {
  pdfId: string;
  filePath: string;
};

export function PdfItemActions({ pdfId, filePath }: PdfItemActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const onDelete = async () => {
    const confirmed = window.confirm(
      "Supprimer ce PDF ? Les générations associées seront supprimées et les crédits déjà utilisés seront perdus."
    );

    if (!confirmed) return;

    await supabase.storage.from("pdfs").remove([filePath]);
    await supabase.from("pdf_documents").delete().eq("id", pdfId);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <Link href={`/pdf-library/${pdfId}`} className="text-sm text-brand-700 underline">
        Ouvrir dans le lecteur
      </Link>
      <Button variant="secondary" onClick={onDelete}>
        Supprimer
      </Button>
    </div>
  );
}
