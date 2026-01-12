import React, { useState } from 'react'
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

  const selectedModel = motorcycleModels.find(m => m.id === value)
  
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
      <div className={`select-trigger ${isOpen ? 'open' : ''} ${error ? 'error' : ''}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
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
          <div className="dropdown-menu">
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
