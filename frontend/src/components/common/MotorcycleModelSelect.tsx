import React, { useState, useRef, useEffect } from 'react'
import './MotorcycleModelSelect.css'

interface MotorcycleModel {
  id: string
  name: string
  year: number
  color: string
  image?: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  motorcycleModels: MotorcycleModel[]
  placeholder?: string
  error?: string
  disabled?: boolean
}

const MotorcycleModelSelect: React.FC<Props> = ({
  value,
  onChange,
  motorcycleModels,
  placeholder = 'เลือกรุ่นรถ...',
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom')
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedModel = motorcycleModels.find(m => m.id === value)

  // Calculate dropdown position after dropdown renders
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !dropdownRef.current) return

    // Use requestAnimationFrame to ensure dropdown is fully rendered
    const timer = requestAnimationFrame(() => {
      if (!triggerRef.current || !dropdownRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const dropdownHeight = dropdownRef.current.offsetHeight
      const viewportHeight = window.innerHeight

      // Calculate space available below and above
      const spaceBelow = viewportHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top

      // If not enough space below and more space above, position on top
      if (spaceBelow < dropdownHeight + 10 && spaceAbove > spaceBelow) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
    })

    return () => cancelAnimationFrame(timer)
  }, [isOpen])
  
  const filteredModels = motorcycleModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.year.toString().includes(searchTerm)
  )

  const handleSelect = (modelId: string) => {
    onChange(modelId)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="motorcycle-model-select">
      <div
        ref={triggerRef}
        className={`select-trigger ${isOpen ? 'open' : ''} ${error ? 'error' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedModel ? (
          <div className="selected-model">
            {selectedModel.image && (
              <img src={selectedModel.image} alt={selectedModel.name} className="model-thumbnail" />
            )}
            <div className="model-info">
              <div className="model-name">{selectedModel.name}</div>
              <div className="model-meta">
                <span className="model-year">{selectedModel.year}</span>
                <span className="model-color">{selectedModel.color}</span>
              </div>
            </div>
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <span className="dropdown-icon">▼</span>
      </div>

      {isOpen && (
        <>
          <div className="dropdown-overlay" onClick={() => setIsOpen(false)}></div>
          <div
            ref={dropdownRef}
            className={`dropdown-menu dropdown-${position}`}
          >
            <div className="search-box">
              <input
                type="text"
                placeholder="ค้นหาชื่อรถหรือปี..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="models-list">
              {filteredModels.length > 0 ? (
                filteredModels.map(model => (
                  <div
                    key={model.id}
                    className={`model-option ${value === model.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(model.id)}
                  >
                    {model.image && (
                      <img src={model.image} alt={model.name} className="option-thumbnail" />
                    )}
                    <div className="option-info">
                      <div className="option-name">{model.name}</div>
                      <div className="option-meta">
                        <span className="option-year">{model.year}</span>
                        <span className="option-color">{model.color}</span>
                      </div>
                    </div>
                    {value === model.id && <span className="checkmark">✓</span>}
                  </div>
                ))
              ) : (
                <div className="no-results">ไม่พบรุ่นรถที่ตรงกัน</div>
              )}
            </div>
          </div>
        </>
      )}

      {error && <span className="error-message">{error}</span>}
    </div>
  )
}

export default MotorcycleModelSelect
