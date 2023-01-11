/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event"
import {screen, waitFor} from "@testing-library/dom"

import Bills from "../containers/Bills.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills"

import { ROUTES, ROUTES_PATH} from "../constants/routes";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then the window icon in the vertical layout should be highlighted", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const windowIcon = screen.getByTestId('icon-window')
      /* [Ajout de tests unitaires et d'intégration] */
      expect(windowIcon).toHaveClass("active-icon")
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a - b);
      const datesSorted = [...dates].sort(antiChrono);

      expect(dates).toEqual(datesSorted);
    })

    describe('When I click on the icon eye', () => {
      test('A modal should open', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
        const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
        document.body.innerHTML = BillsUI({data:bills})
        const employeeBillsPage = new Bills({
          document, onNavigate, store: mockStore, localStorage: localStorageMock
        })

        const handleClickIconEye = jest.fn((event) => employeeBillsPage.handleClickIconEye(event))
        const allIconEyes = screen.getAllByTestId('icon-eye')
        const modale = screen.getByTestId('modaleFile')
        $.fn.modal = jest.fn();

        allIconEyes.forEach((iconEye) => {
          iconEye.addEventListener('click', handleClickIconEye(iconEye))
          userEvent.click(iconEye)
        })

        expect(handleClickIconEye).toHaveBeenCalledTimes(4)
        expect(modale).toBeVisible()
        expect(modale).toBeTruthy()
        expect(screen.getByText('Justificatif')).toBeVisible()
      })
    })

    describe('When I click on the new bill button', () => {
      test('Then I should be redirected to the NewBill page', async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
        const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}
        document.body.innerHTML = BillsUI({data:bills})
        const employeeBillsPage = new Bills({
          document, onNavigate, store: mockStore, localStorage: localStorageMock
        })
        const handleClickNewBill = jest.fn((event) => employeeBillsPage.handleClickNewBill(event))
        const newBillButton = screen.getByRole('button', {name: /nouvelle note de frais/i})
        newBillButton.addEventListener('click', handleClickNewBill)

        userEvent.click(newBillButton)
        
        await waitFor(() => expect(handleClickNewBill).toHaveBeenCalledTimes(1))
        expect(screen.getByText('Envoyer une note de frais')).toBeVisible()
      })
    })
  })
})

/**
 * Test d'intégration GET Bills
 */
describe("Given I am connected as an Employee", () => {
  describe("When I navigate to the Bills page", () => {
    test("Then it should fetch bills from the API", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const tableBody = await waitFor(() => screen.getByTestId('tbody'))

      expect(tableBody).toBeTruthy()
      expect(screen.getByText('test3')).toBeVisible()
    })

  describe("When an error occurs on the API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: "a@a"}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("Then it should fetch bills from the API and fail with a 404 error message", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await waitFor(() => screen.getByText(/Erreur 404/))
      expect(message).toBeTruthy()
    })

    test("It should fetch messages from the API and fail with a 500 error message", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await waitFor(() => screen.getByText(/Erreur 500/))
      expect(message).toBeTruthy()
    })
  })
  })
})
