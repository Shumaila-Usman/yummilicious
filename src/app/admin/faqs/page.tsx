"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/AdminProviders";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

type Item = {
  _id: string;
  question: string;
  answer: string;
  isActive: boolean;
};

export default function AdminFaqsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () =>
    adminFetch<{ faqs: Item[] }>("/api/faqs?admin=true&limit=100").then((res) => {
      if (res.data?.faqs) setItems(res.data.faqs);
    });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    if (editingId) {
      const res = await adminFetch(`/api/faqs/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({ question, answer }),
      });
      if (res.error) return toast.error(res.error);
      toast.success("Updated");
    } else {
      const res = await adminFetch("/api/faqs", {
        method: "POST",
        body: JSON.stringify({ question, answer }),
      });
      if (res.error) return toast.error(res.error);
      toast.success("Added");
    }
    setQuestion("");
    setAnswer("");
    setEditingId(null);
    await load();
  };

  const remove = async () => {
    if (!deleteId) return;
    const res = await adminFetch(`/api/faqs/${deleteId}`, { method: "DELETE" });
    if (res.error) toast.error(res.error);
    else {
      toast.success("Deleted");
      setDeleteId(null);
      await load();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brown">FAQs</h1>
        <p className="text-sm text-muted">
          Questions & answers on the FAQs page. Hero copy is under Pages → FAQs.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-burgundy/10 bg-cream p-5">
        <h2 className="font-display text-lg font-bold text-burgundy">
          {editingId ? "Edit FAQ" : "Add FAQ"}
        </h2>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
          className="w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm"
        />
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Answer"
          rows={3}
          className="w-full rounded-lg border border-burgundy/20 bg-white px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <Button onClick={save} className="gap-2">
            <Plus className="h-4 w-4" />
            {editingId ? "Save" : "Add"}
          </Button>
          {editingId && (
            <Button
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setQuestion("");
                setAnswer("");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {loading && <div className="h-20 animate-pulse rounded-2xl bg-burgundy/5" />}
        {items.map((item) => (
          <div
            key={item._id}
            className="rounded-2xl border border-burgundy/10 bg-cream p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-brown">{item.question}</p>
                <p className="mt-1 text-sm text-muted">{item.answer}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(item._id);
                    setQuestion(item.question);
                    setAnswer(item.answer);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  className="text-burgundy"
                  onClick={() => setDeleteId(item._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Delete FAQ?"
        message="This cannot be undone."
        onConfirm={remove}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
