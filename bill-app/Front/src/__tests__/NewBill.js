/**
 * @jest-environment jsdom
 */

/* [Ajout de tests unitaires et d'intégration] */
import "@testing-library/jest-dom"
import { screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"
import userEvent from "@testing-library/user-event"

jest.mock("../app/store", () => mockStore)

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: "a@a"}));
  const root = document.createElement("div")
  root.setAttribute("id", "root")
  document.body.append(root)
  router()
  document.body.innerHTML = NewBillUI()
  window.onNavigate(ROUTES_PATH.NewBill)
  const onNavigate = pathname => {document.body.innerHTML = ROUTES({ pathname });};
})

afterEach(() => {
  jest.resetAllMocks(); //Resets the state of all mocks. Equivalent to calling .mockReset() on every mocked function. Returns the jest object for chaining.
  document.body.innerHTML = "";
})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the mail icon in the vertical layout should be highlighted", () => {
      expect(mailIcon()).toHaveClass("active-icon")
    })
    test("Then the window icon in the vertical layout should not be highlighted", () => {
      expect(windowIcon()).not.toHaveClass("active-icon")
    })
    test("Then the new bill form should be visible", () => {
      expect(form()).toBeVisible()
    })
    test("Then the form should have a visible submit button", () => {
      expect(submitButton()).toBeVisible()
    })
    test("Then the form should have an optional text area with a visible label", () => {
      expect(commentary()).not.toBeRequired();
    })
    test("Then the form should have a default expense type selected", () => {
      expect(screen.getByDisplayValue('Transports')).toBeTruthy()
    })
    test("Then the form should have 6 required fields", () => {
      expect(expenseName()).toBeRequired()
      expect(datepicker()).toBeRequired()
      expect(amount()).toBeRequired()
      expect(vat()).toBeRequired()
      expect(pct()).toBeRequired()
      expect(fileInput()).toBeRequired()
    })
  })
})

//handleChangeName
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I type an empty string into the expense name input", () => {      
      test("Then aria invalid should be true and the aria error message should be visible", () => {
        const handleChangeName = jest.fn((event) => newBill().handleChangeName(event))
        expenseName().addEventListener("input", handleChangeName)

        userEvent.type(expenseName(), ' ')

        expect(handleChangeName).toHaveBeenCalledTimes(1)
        expect(expenseName()).toHaveAttribute('aria-invalid', expect.stringMatching('true'))
        expect(expenseName()).not.toBeValid()
        expect(expenseNameErrorMessage()).toBeVisible()
        expect(expenseName()).toHaveErrorMessage(expenseNameErrorMessage().textContent) //need .textContent or a span is expected but a string is received
      })
    })

    describe("When I type a valid expense name", () => {
      test("Then aria invalid should be false and the aria error message should not be visible", () => {
        const handleChangeName = jest.fn((event) => newBill().handleChangeName(event))
        expenseName().addEventListener("input", handleChangeName)

        userEvent.type(expenseName(), 'Déjeuner avec client')

        expect(expenseName()).toHaveValue('Déjeuner avec client')
        expect(handleChangeName).toHaveBeenCalled()
        expect(expenseName().value).toStrictEqual('Déjeuner avec client')
        expect(expenseName()).toHaveAttribute('aria-invalid', expect.stringMatching('false'))
        expect(expenseName()).not.toHaveErrorMessage(expenseNameErrorMessage().textContent)
      })
    })
  })
})

//handleChangeFile
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I upload an invalid file type", () => {      
      test("Then aria invalid should be true and the aria error message should be visible", () => {
        const handleChangeFile = jest.fn((event) => newBill().handleChangeFile(event))
        fileInput().addEventListener("change", handleChangeFile)
        const samplePDFfile = new File(["sample"], "sample.pdf", {type: "application/pdf"})

        userEvent.upload(fileInput(), samplePDFfile)

        expect(handleChangeFile).toHaveBeenCalledTimes(1)
        expect(fileInput()).toHaveAttribute('aria-invalid', expect.stringMatching('true'))
        expect(fileInput()).not.toBeValid()
        expect(fileErrorMessage()).toBeVisible()
        expect(fileInput()).toHaveErrorMessage(fileErrorMessage().textContent) //need .textContent or a span is expected but a string is received
      })
    })

    describe("When I upload a valid file type", () => {
      test("Then aria invalid should be false and the aria error message should not be visible", () => {
        const handleChangeFile = jest.fn((event) => newBill().handleChangeFile(event))
        fileInput().addEventListener("change", handleChangeFile)
        const samplePNGfile = new File(["sample"], "sample.png", {type: "image/png"})

        userEvent.upload(fileInput(), samplePNGfile)

        expect(fileInput().files[0]).toStrictEqual(samplePNGfile)
        expect(handleChangeFile).toHaveBeenCalledTimes(1)
        expect(fileInput()).toHaveAttribute('aria-invalid', expect.stringMatching('false'))
        expect(fileInput()).not.toHaveErrorMessage(fileErrorMessage().textContent)
      })
    })
  })
})

/**
 * Test d'intégration POST new bill
 */
//handleSubmit
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When the required fields are not completed and I click submit", () => {
      test("Then the form should still be visible and I should not be redirected to the Bills page", async () => {
        const onNavigate = pathname => {document.body.innerHTML = ROUTES({ pathname });};
        const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage});
        const handleSubmit = jest.fn((event) => newBill.handleSubmit(event))
        form().addEventListener("submit", handleSubmit);

        userEvent.type(expenseName(), 'encore')
        userEvent.click(submitButton())

        await waitFor(() => {
          expect(handleSubmit).toHaveBeenCalledTimes(1)
        })

        expect(form()).toBeVisible();
      })

    })
    describe("When all required fields are completed and I click submit", () => {
      test("Then the form should be submitted and I should be redirected to the Bills page", async () => {
        const onNavigate = pathname => {document.body.innerHTML = ROUTES({ pathname });};
        const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage});
        const handleChangeFile = jest.fn((event) => newBill.handleChangeFile(event))
        fileInput().addEventListener("change", handleChangeFile)
        const handleSubmit = jest.fn((event) => newBill.handleSubmit(event))
        form().addEventListener("submit", handleSubmit)
        const testFile = new File(["img"], "preview-facture-free-201801-pdf-1.jpg", {type: "image/jpg"})

        userEvent.selectOptions(expenseType(), ['Hôtel et logement'])
        userEvent.type(expenseName(), 'encore')
        userEvent.type(datepicker(), '2004-04-04')
        userEvent.type(amount(), '400')
        userEvent.type(vat(), '80')
        userEvent.type(pct(), '20')
        userEvent.type(commentary(), 'séminaire billed')
        userEvent.upload(fileInput(), testFile)

        expect(screen.getByRole('option', {name: 'Hôtel et logement'}).selected).toBe(true)
        expect(screen.getByRole('option', {name: 'Transports'}).selected).toBe(false)

        await waitFor(() => {
          expect(handleChangeFile).toHaveBeenCalledTimes(1)
          expect(fileInput()).toHaveAttribute('aria-invalid', expect.stringMatching('false'))
          expect(fileInput().files[0]).toStrictEqual(testFile)
        })

        expect(form()).toHaveFormValues({
          expenseName: 'encore',
          datepicker:'2004-04-04',
          amount: 400,
          vat: 80,
          pct: 20,
          commentary: 'séminaire billed',
        })

        userEvent.click(submitButton())

        await waitFor(() => {
          expect(handleSubmit).toHaveBeenCalledTimes(1)
        })
        expect(screen.getByText("Mes notes de frais")).toBeTruthy()
        expect(screen.getByRole('button', {name: /nouvelle note de frais/i})).toBeVisible()
      })
    })
  })
})

//Helper functions//
function newBill(){return new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})}
function mailIcon(){return screen.getByTestId('icon-mail')}
function windowIcon(){return screen.getByTestId('icon-window')}
function form(){return screen.getByTestId('form-new-bill')}
function expenseType(){return screen.getByTestId('expense-type')}
function expenseName(){return screen.getByTestId('expense-name')}
function expenseNameErrorMessage(){return (screen.getByTestId('errName'))}
function datepicker(){return screen.getByTestId('datepicker')}
function amount(){return screen.getByTestId('amount')}
function vat(){return screen.getByTestId('vat')}
function pct(){return screen.getByTestId('pct')}
function commentary(){return screen.getByTestId('commentary')}
function fileInput(){return screen.getByTestId('file')}
function fileErrorMessage(){return (screen.getByTestId('errFile'))}
function submitButton(){return screen.getByRole('button', {name: /envoyer/i})}
