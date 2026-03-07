interface SearchBoxProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export default function SearchBox({ value, onChange, placeholder = 'ค้นหา...' }: SearchBoxProps) {
    return (
        <div className="flex items-center" style={{ width: '30%' }}>
            <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7 7 0 1 0 6.65 16.65 7 7 0 0 0 16.65 16.65z" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-400"
                />
            </div>
            <button
                onClick={() => { }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-r-lg transition-colors flex items-center gap-1.5 border border-amber-500 shrink-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7 7 0 1 0 6.65 16.65 7 7 0 0 0 16.65 16.65z" />
                </svg>
                ค้นหา
            </button>
        </div>
    )
}
