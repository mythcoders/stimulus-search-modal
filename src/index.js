import { Controller } from 'stimulus'
import { axios } from 'axios'

export default class extends Controller {
  static values = {
    autoLoad: Boolean,
    required: Boolean,
    resourceName: String,
    resourceUrl: String
  }
  static targets = [
    "displayField",
    "emptySearchTemplate",
    "failedSearchTemplate",
    "formField",
    "loadingIndicator",
    "modal",
    "results",
    "searchField",
  ]

  connect() {
    this.loadingIndicatorTarget.hidden = true

    if (this.autoLoadValue) {
      this.updateResults()
    } else {
      this.resultsTarget.innerHTML = this.emptySearchTemplateTarget.innerHTML
    }

    if (this.formFieldTarget.value === "") {
      if (this.requiredValue) {
        this.displayFieldTarget.placeholder = "Required - click to search"
      } else {
        this.displayFieldTarget.placeholder = "Optional - click to search"
      }
    }

    $(this.modalTarget).on('shown.bs.modal', function () {
      this.searchFieldTargets[0].focus()
    }.bind(this))
  }

  selectRecord(e) {
    e.preventDefault()

    // TODO: Add styling to indicate selected record
    this.displayFieldTarget.placeholder = e.currentTarget.dataset.label
    this.formFieldTarget.value = e.currentTarget.dataset.value
    $(this.modalTarget).modal('hide')
  }

  showModal() {
    $(this.modalTarget).modal('show')
  }

  loadAll(e) {
    e.preventDefault()
    this.updateResults()
  }

  submitSearch(e) {
    e.preventDefault()

    if (!this.autoLoadValue && Object.values(this.formData()).some(p => p.length < 1)) {
      return
    }

    this.updateResults()
  }

  formData() {
    return this.searchFieldTargets
      .map(p => ({ [p.name]: p.value }))
      .reduce((a, b) => Object.assign(a, b), {})
  }

  // private methods

  updateResults() {
    this.resultsTarget.innerHTML = ""
    this.loadingIndicatorTarget.hidden = false
    axios.post(this.resourceUrlValue, this.formData()).then(response => {
      this.resultsTarget.innerHTML = response.data
    }).catch(response => {
      console.error(response)
      this.resultsTarget.innerHTML = this.failedSearchTemplateTarget.innerHTML
    }).finally(() => {
      this.loadingIndicatorTarget.hidden = true
    })
  }
}
