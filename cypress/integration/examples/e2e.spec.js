/// <reference types="cypress" />

const { Machine } = require('xstate');
const { createModel } = require('@xstate/test');
const { feedbackStates } = require('../../../src/feedbackMachine');

function addTests(state, tests) {
  return {
    ...state,
    states: Object.entries(state.states).reduce((s, [stateKey, stateValue]) => {
      return {
        ...s,
        [stateKey]: {
          ...stateValue,
          meta: {
            ...stateValue.meta,
            test: tests[stateKey]
          }
        }
      };
    }, {})
  };
}

describe('feedback app', () => {
  const feedbackMachine = Machine(
    addTests(feedbackStates, {
      question: ({ findByTestId }) => {
        findByTestId('question-screen');
      },
      form: ({ findByTestId }) => {
        findByTestId('form-screen');
      },
      thanks: ({ findByTestId }) => {
        findByTestId('thanks-screen');
      },
      closed: ({ findByTestId }) => {
        findByTestId('thanks-screen').should('not.exist');
      }
    })
  );

  const testModel = createModel(feedbackMachine).withEvents({
    CLICK_GOOD: ({ findByTestId }) => {
      findByTestId('good-button').click();
    },
    CLICK_BAD: ({ findByTestId }) => {
      findByTestId('bad-button').click();
    },
    CLOSE: ({ findByTestId }) => {
      findByTestId('close-button').click();
    },
    ESC: () => {
      cy.get('body').type('{esc}');
    },
    SUBMIT: {
      exec: ({ findByTestId }, event) => {
        findByTestId('response-input').type(event.value);
        findByTestId('submit-button').click();
      },
      cases: [{ value: 'something' }]
    }
  });

  const testPlans = testModel.getSimplePathPlans();

  testPlans.forEach((plan, i) => {
    describe(plan.description, () => {
      plan.paths.forEach((path, i) => {
        it(path.description, () => {
          return cy.visit('http://localhost:3000/').then(() => {
            return path.test(cy);
          });
        });
      });
    });
  });

  describe('coverage', () => {
    it('should pass', () => {
      testModel.testCoverage();
    });
  });
});
