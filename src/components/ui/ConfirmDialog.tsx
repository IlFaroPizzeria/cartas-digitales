"use client";

// Modal de confirmación reutilizable, para sustituir los confirm() nativos
// del navegador (que no se pueden estilizar y en algunos móviles se ven
// muy bruscos) en acciones destructivas como borrar un plato o categoría.
type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  danger = true,
  pending = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="confirm-dialog-title"
          className="text-base font-semibold text-slate-900"
        >
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 text-sm text-slate-600">{description}</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-brand hover:bg-brand-dark"
            }`}
          >
            {pending ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
