export function DemoPopup({
  ok,
  title,
  message,
  onClose,
}: {
  ok: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div
          className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${
            ok ? "bg-secondary-container/30" : "bg-red-100"
          }`}
        >
          {ok ? (
            <svg className="h-7 w-7 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-7 w-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <h3 className="font-headline-md text-xl font-bold text-primary mb-2">{title}</h3>
        <p className="font-body-md text-on-surface-variant mb-8">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-primary text-white py-3 font-label-md text-label-md font-semibold hover:-translate-y-0.5 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
