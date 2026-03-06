import React from 'react'

interface Props {
  province: string
  top: string
  bottom: string
  onProvinceChange: (value: string) => void
  onTopChange: (value: string) => void
  onBottomChange: (value: string) => void
  provinceError?: string
  licensePlateError?: string
  isSubmitting?: boolean
  provinces: string[]
}

const LicensePlateInput: React.FC<Props> = ({
  province,
  top,
  bottom,
  onProvinceChange,
  onTopChange,
  onBottomChange,
  provinceError,
  licensePlateError,
  isSubmitting = false,
  provinces,
}) => {
  return (
    <div className="form-group">
      <label>
        ป้ายทะเบียน <span className="required">*</span>
      </label>

      <div className="license-province-wrapper">
        <label className="license-input-label">จังหวัด</label>
        <select
          name="licenseProvince"
          value={province}
          onChange={(e) => onProvinceChange(e.target.value)}
          className={`form-input license-province-select ${provinceError ? 'error' : ''}`}
          disabled={isSubmitting}
        >
          <option value="">-- เลือกจังหวัด --</option>
          {provinces.map(prov => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
        {provinceError && <span className="error-message">{provinceError}</span>}
      </div>

      <div className="license-plate-inputs">
        <div className="license-input-wrapper">
          <label className="license-input-label">บรรทัดบน</label>
          <input
            type="text"
            name="licensePlateTop"
            value={top}
            onChange={(e) => onTopChange(e.target.value)}
            placeholder="เช่น กก"
            className={`form-input ${licensePlateError ? 'error' : ''}`}
            disabled={isSubmitting}
          />
        </div>
        <div className="license-input-wrapper">
          <label className="license-input-label">บรรทัดล่าง</label>
          <input
            type="text"
            name="licensePlateBottom"
            value={bottom}
            onChange={(e) => onBottomChange(e.target.value)}
            placeholder="เช่น 1111"
            className={`form-input ${licensePlateError ? 'error' : ''}`}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="license-plate-preview">
        <label className="preview-label">ตัวอย่าง</label>
        <div className="plate-display">
          <div className="plate-row plate-row-top">
            <span className="plate-text">{top || 'กก'}</span>
          </div>
          <div className="plate-row plate-row-middle">
            <span className="plate-text">{province || 'จังหวัด'}</span>
          </div>
          <div className="plate-row plate-row-bottom">
            <span className="plate-text-bottom">{bottom || '1111'}</span>
          </div>
        </div>
      </div>
      {licensePlateError && <span className="error-message">{licensePlateError}</span>}
    </div>
  )
}

export default LicensePlateInput
