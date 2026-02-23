import './StepInitial.css'
import ProgressIndicator from '../common/ProgressIndicator'

interface Props {
  onSelectExisting: () => void
  onSelectNew: () => void
}

export default function StepInitial({ onSelectExisting, onSelectNew }: Props) {
  return (
    <div className="step-initial">
      <div className="initial-card">
        <div className="step-header">
          <ProgressIndicator currentStep="check" />
          <p className="step-title">เช็คประวัติลูกค้า</p>
        </div>

        <div className="initial-content">
          <p className="main-question">ลูกค้าเคยใช้บริการที่ศูนย์บริการของเรามาก่อนหรือไม่?</p>

          <div className="options-grid">
            <button className="option-card existing-card" onClick={onSelectExisting}>
              <h3>ลูกค้าเก่า</h3>
              <p>ค้นหาข้อมูลจากระบบ</p>
            </button>

            <button className="option-card new-card" onClick={onSelectNew}>
              <h3>ลูกค้าใหม่</h3>
              <p>ลงทะเบียนข้อมูลลูกค้าใหม่</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
