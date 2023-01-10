import VerticalLayout from './VerticalLayout.js'

/**
 * Bug Hunt - Bills
 */
export default () => {

  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Envoyer une note de frais </div>
        </div>
        <div class="form-newbill-container content-inner">
          <form data-testid="form-new-bill">
            <div class="row">
                <div class="col-md-6">
                  <div class="col-half">
                    <label for="expense-type" class="bold-label">Type de dépense</label>
                      <select required class="form-control blue-border" name="expense-type" id="expenseType" data-testid="expense-type">
                        <option>Transports</option>
                        <option>Restaurants et bars</option>
                        <option>Hôtel et logement</option>
                        <option>Services en ligne</option>
                        <option>IT et électronique</option>
                        <option>Equipement et matériel</option>
                        <option>Fournitures de bureau</option>
                      </select>
                  </div>
                  <div class="col-half">
                    <label for="expense-name" class="bold-label">Nom de la dépense</label>
                    <input required type="text" class="form-control blue-border" id="expense-name" name="expenseName" data-testid="expense-name" placeholder="Vol Paris Londres" 
                    aria-invalid="false" aria-errormessage="errName"/>
                    <span id="errName" data-testid="errName" class="errormessage">Veuillez saisir le nom de la dépense</span>
                  </div>
                  <div class="col-half">
                    <label for="datepicker" class="bold-label">Date</label>
                    <input required type="date" class="form-control blue-border" name="datepicker" id="datepicker" data-testid="datepicker" />
                  </div>
                  <div class="col-half">
                    <label for="amount" class="bold-label">Montant TTC </label>
                    <input required type="number" class="form-control blue-border input-icon input-icon-right" name="amount" id="amount" data-testid="amount" min="1" placeholder="348"/>
                  </div>
                  <div class="col-half-row">
                    <div class="flex-col">
                      <label for="vat" class="bold-label">TVA</label>
                      <input required type="number" class="form-control blue-border" name="vat" id="vat" data-testid="vat" min="0" placeholder="70" />
                    </div>
                    <div class="flex-col">
                      <label for="pct" class="white-text">%</label>
                      <input required type="number" class="form-control blue-border" name="pct" id="pct" data-testid="pct" min="0" placeholder="20" />
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="col-half">
                    <label for="commentary" class="bold-label">Commentaire</label>
                    <textarea name="commentary" class="form-control blue-border" id="commentary" data-testid="commentary" rows="3"></textarea>
                  </div>
                  <div class="col-half">
                    <label for="file" class="bold-label">Justificatif</label>
                    <input required name="file" type="file" class="form-control blue-border" id="file" data-testid="file"
                    aria-errormessage="errFile" aria-invalid="false"/>
                    <span id="errFile" data-testid="errFile" class="errormessage">Veuillez télécharger une image en format .jpg .jpeg ou .png</span>
                  </div>
                </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="col-half">
                  <button type="submit" id='btn-send-bill' data-testid="btn-send-bill" class="btn btn-primary">Envoyer</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `)
}