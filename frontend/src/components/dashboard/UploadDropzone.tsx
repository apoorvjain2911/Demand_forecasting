import type { ChangeEvent, DragEvent } from 'react'

interface UploadDropzoneProps {
  fileName: string | null
  dragging: boolean
  progress: number
  disabled: boolean
  onFileSelect: (file: File) => void
  onDropFile: (file: File) => void
  onDragStateChange?: (dragging: boolean) => void
}

function UploadDropzone({ fileName, dragging, progress, disabled, onFileSelect, onDropFile, onDragStateChange }: UploadDropzoneProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <label
      className={[
        'block cursor-pointer rounded-[28px] border-2 border-dashed p-8 transition-all duration-200',
        dragging ? 'border-signal bg-signal/10' : 'border-white/15 bg-white/5 hover:border-signal/40 hover:bg-white/8',
        disabled ? 'pointer-events-none opacity-70' : '',
      ].join(' ')}
      onDragOver={(event: DragEvent<HTMLLabelElement>) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const file = event.dataTransfer.files?.[0]
        if (file) {
          onDropFile(file)
        }
      }}
      onDragEnter={() => onDragStateChange?.(true)}
      onDragLeave={() => onDragStateChange?.(false)}
    >
      <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleChange} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-signal/80">CSV upload</div>
          <div className="mt-2 font-display text-2xl font-semibold text-white">Drag and drop sales data here</div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Upload a historical sales CSV and the backend will validate the file, train the model, generate forecasts, and return executive insights in one step.
          </p>
        </div>
        <div className="min-w-[230px] rounded-3xl border border-white/10 bg-midnight/40 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Upload progress</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-signal to-ember transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 text-sm text-slate-300">{fileName ?? 'No file selected yet'}</div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">CSV only</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">Automatic training</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">Forecasts + insights</span>
      </div>
      {fileName ? <div className="mt-4 text-sm text-signal">Selected file: {fileName}</div> : null}
    </label>
  )
}

export default UploadDropzone