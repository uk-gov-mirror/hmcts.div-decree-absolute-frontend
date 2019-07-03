const { Interstitial } = require('@hmcts/one-per-page/steps');
const { goTo } = require('@hmcts/one-per-page/flow');
const logger = require('services/logger').getLogger(__filename);
const config = require('config');
const idam = require('services/idam');

const progressStates = {
  awaitingDecreeAbsolute: 'awaitingDecreeAbsolute',
  divorceGranted: 'divorceGranted',
  other: 'other'
};

const caseStateMap = [
  {
    template: './sections/ThreeCirclesFilledIn.html',
    state: ['AwaitingDecreeAbsolute']
  },
  {
    template: './sections/FourCirclesFilledIn.html',
    state: ['DivorceGranted']
  }
];

class ProgressBar extends Interstitial {
  static get path() {
    return config.paths.petitioner.progressBar;
  }

  get session() {
    return this.req.session;
  }

  get case() {
    return this.req.session.case.data;
  }

  get caseId() {
    return this.req.session.case.caseId;
  }

  get middleware() {
    return [
      ...super.middleware,
      idam.protect()
    ];
  }

  next() {
    return goTo(this.journey.steps.Exit);
  }

  get progressStates() {
    return progressStates;
  }

  getProgressBarContent() {
    const caseState = this.session.case.state;

    if (this.isCaseStateAwaitingDA(caseState)) {
      return this.progressStates.awaitingDecreeAbsolute;
    } else if (this.isCaseStateDivorceGranted(caseState)) {
      return this.progressStates.divorceGranted;
    }

    logger.errorWithReq(this.req, 'progress_bar_content', 'No valid DA case state for ProgressBar page', caseState);
    return this.progressStates.other;
  }

  isCaseStateAwaitingDA(caseState) {
    return caseState === config.caseStates.AwaitingDecreeAbsolute;
  }

  isCaseStateDivorceGranted(caseState) {
    return caseState === config.caseStates.DivorceGranted;
  }

  get currentCaseState() {
    return this.req.session.case.state;
  }

  // Select the correct template based on case state
  // decides which circles should be filled in - either 3 or 4
  get stateTemplate() {
    let template = '';
    caseStateMap.forEach(dataMap => {
      if (dataMap.state.includes(this.currentCaseState)) {
        template = dataMap.template;
      }
    });

    return template || './sections/ThreeCirclesFilledIn.html';
  }
}

module.exports = ProgressBar;