import { Machine } from 'xstate';

export const feedbackStates = {
  id: 'feedback',
  initial: 'question',
  states: {
    question: {
      on: {
        CLICK_GOOD: 'thanks',
        CLICK_BAD: 'form',
        ESC: 'closed',
        CLOSE: 'closed'
      }
    },
    form: {
      on: {
        SUBMIT: [
          {
            target: 'thanks',
            cond: (_, e) => {
              return e.value.length > 0;
            }
          }
        ],
        CLOSE: 'closed'
      }
    },
    thanks: {
      on: {
        CLOSE: 'closed'
      }
    },
    closed: {
      type: 'final'
    }
  }
};
export const feedbackMachine = Machine(feedbackStates);
