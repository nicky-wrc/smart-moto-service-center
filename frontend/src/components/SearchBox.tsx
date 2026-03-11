interface SearchBoxProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    children?: React.ReactNode
}

export default function SearchBox({ value, onChange, placeholder = 'ค้นหา...', children }: SearchBoxProps) {
    return (
        <div className="flex items-center gap-3 w-full md:w-[400px]">
            <div className="relative flex-1">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors"
                />
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            {children}
        </div>
    )
}
