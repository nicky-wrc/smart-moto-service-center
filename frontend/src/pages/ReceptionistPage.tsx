import { useState } from 'react'
import type { ICustomer, ReceptionistStep } from '../types'
import StepInitial from '../components/receptionist/StepInitial'
import StepSearch from '../components/receptionist/StepSearch'
import StepRegister from '../components/receptionist/StepRegister'
import StepConfirm from '../components/receptionist/StepConfirm'
import ReceptionistHeader from '../components/receptionist/ReceptionistHeader'
import ReceptionistFooter from '../components/receptionist/ReceptionistFooter'
import './ReceptionistPage.css'

export default function ReceptionistPage() {
  const [step, setStep] = useState<ReceptionistStep>('check')
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null)

  const handleSelectExisting = () => {
    setStep('search')
  }

  const handleSelectNew = () => {
    setStep('register')
    setSelectedCustomer(null)
  }

  const handleCustomerFound = (customer: ICustomer) => {
    setSelectedCustomer(customer)
    setStep('confirm')
  }

  const handleCustomerCreated = (customer: ICustomer) => {
    setSelectedCustomer(customer)
    setStep('confirm')
  }

  const handleBack = () => {
    setStep('check')
    setSelectedCustomer(null)
  }

  const handleConfirm = () => {
    // ส่งข้อมูลให้หัวหน้าช่าง
    setStep('check')
    setSelectedCustomer(null)
  }

  return (
    <div className="receptionist-page">
      <div className="receptionist-container">
        {/* Header */}
        <ReceptionistHeader currentStep={step} />

        {/* Main Content */}
        <main className="receptionist-main">
          {step === 'check' && <StepInitial onSelectExisting={handleSelectExisting} onSelectNew={handleSelectNew} />}

          {step === 'search' && <StepSearch onCustomerFound={handleCustomerFound} onBack={handleBack} />}

          {step === 'register' && <StepRegister onCustomerCreated={handleCustomerCreated} onBack={handleBack} />}

          {step === 'confirm' && selectedCustomer && (
            <StepConfirm customer={selectedCustomer} onConfirm={handleConfirm} onBack={handleBack} />
          )}
        </main>

        {/* Footer */}
        <ReceptionistFooter />
      </div>
    </div>
  )
}

