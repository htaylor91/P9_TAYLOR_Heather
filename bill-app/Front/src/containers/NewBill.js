import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

/**
 * Bug Hunt - Bills
 */

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    const fileInput = this.document.querySelector(`input[data-testid="file"]`)
    const expenseName = this.document.querySelector(`input[data-testid="expense-name"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    fileInput.addEventListener("change", this.handleChangeFile)
    expenseName.addEventListener("input", this.handleChangeName)
    this.email = JSON.parse(localStorage.getItem("user")).email
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    e.preventDefault()
    const fileInput = e.target
    const file = e.target.files[0]
    const filePath = e.target.value.split(/\\/g)
    this.fileName = filePath[filePath.length-1]
    const formData = new FormData()
    const fileTypes = ["image/jpeg","image/jpg","image/png"];
    const submitFormButton = this.document.querySelector(`button[id="btn-send-bill"]`)
    const validFileType = (file) => {
      if(file === undefined){
        return false
      }
      return fileTypes.includes(file.type);
    }

    if(validFileType(file) && file !== undefined){
        submitFormButton.removeAttribute('disabled')
        fileInput.setAttribute('aria-invalid', 'false')
        formData.append('file', file)
        formData.append('email', this.email)
        this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({fileUrl, key}) => {
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = this.fileName
        }).catch(error => console.error(error))
    } else {
      fileInput.setAttribute('aria-invalid', 'true')
      submitFormButton.setAttribute('disabled', '')
    }
  }

  handleChangeName = e => {
    e.preventDefault()
    const name = e.target
    const submitFormButton = this.document.querySelector(`button[id="btn-send-bill"]`)
    if((name.value.trim()) === ''){
      name.setAttribute('aria-invalid', 'true')
      submitFormButton.setAttribute('disabled', '')
    } else {
      name.setAttribute('aria-invalid', 'false')
      submitFormButton.removeAttribute('disabled')
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    const bill = {
      email: this.email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value.trim(),
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: parseInt(e.target.querySelector(`input[data-testid="vat"]`).value),
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }

    const validForm = (bill) => {
      if(
        bill.type === null || 
        bill.name === null || 
        bill.name === '' ||
        bill.amount === null ||
        bill.amount <= 0 ||
        bill.vat === null ||
        bill.pct === null ||
        bill.fileName === null || 
        bill.status === undefined){
          return false
        } else {
        return true
      }
    }

    if(validForm(bill) === true){
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
      return
    }
  }

  // no need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}