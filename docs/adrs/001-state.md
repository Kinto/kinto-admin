# The state of state management in kinto-admin

 - Status: implementing
 - Date: 2025-03-20


Tracking issues:
 - [Draft ADR for state management / data fetching strategies throughout app](https://github.com/Kinto/kinto-admin/issues/3262)
 - [Migrate Redux setup to Redux Toolkit](https://github.com/Kinto/kinto-admin/issues/2135)
 - [Consider Redux Saga Test Plan for saga testing](https://github.com/Kinto/kinto-admin/issues/2133)


## Context and Problem Statement
When kinto-admin was originally created in 2015, react didn’t have state management. Redux was the standard answer at this time as it provided a way for devs to inject state into components.

Years later (2019), react 16.8 introduced hooks along with functional components. This combination created a simplified process (compared to redux) for managing state within the component lifecycle.

Today we’re now in somewhat of a middle ground. We use hooks in some places where state is restricted to a component (ex: AuthForm), but redux is still the dominant answer.

Should we migrate kinto-admin away from redux?


## Decision Drivers
 - Reduce barrier to entry
    - Can we make contributing to kinto-admin easier for newer devs? Maybe even back-end focused devs?
 - Simplify code
    - Can we reduce the lines of code needed for new functionality?
    - Can we reduce lines of code for existing functionality?
    - Can we make state management easier to understand? 
 - Reduce maintenance
    - Can we reduce dependencies?
    - Can we make unit tests easier to work with?

## Proposed Solution
Option 2 - Migrate to hooks

We have already put in the effort to convert our components to be functional. This was done last year (2023) to make the code easier to work with (simplified life-cycle). Thanks to this previous work, migrating to hooks will be a low effort task with decent rewards.

### Decision driver impact:
 - Reduced barrier to entry
      - Devs who are new to react will be able to follow this code more easily.
  - Simplified code
      - Removes over 2,000 lines of plumbing code from kinto-admin.
          - 41 sagas * 45-50 lines of plumbing for each (on avg)
      - Simplifies state actions
          - Redux: User interaction → Listener → Dispatch actions → Sagas → Actions → Reducers → Modify state → Rerender
          - Hooks: User interaction → Listener → [ Dispatch hook → Modify state → Rerender]
      - Reduces need to pass state to child components
  - Reduced maintenance
      - Removes redux dependencies
      - Tests now focus more on business logic and less on supporting events. Ex: no more `expect(saga.next().value).toEqual(put(actions.actionName(params)));`
      - Every line of code is one that will need to maintained _eventually_. Less code = less maintenance.

### Implementation plan A - Sprint
1. Create issues for all Redux state
    - Group sagas logically. Ex: auth state, bucket state, etc.
2. Swarm and knock them all out over the course of a sprint
    - Use multiple PR's (one per issue if possible) to make reviews easier
    - Make multiple releases (continuous delivery) to easily identify possible issues faster

### Implementation plan B - Gradual
1. Devs should create hooks going forward for any new state
2. Migrate a few components: measure how much effort a typical migration requires (typical time spent per saga/component)
3. Institute a camp site policy. When a user is working on a component, migrate the state it uses to hooks.
    - This will create duplicated code (a hook and a saga) in some shared state for a while. This is OK.
4. Open tickets for the remaining sagas/components so they can be worked.

## Considered Options

### Option 1 - Make no changes, keep redux
Redux is our current state management tool.

#### Pros
 - Kinto-Admin works well and is stable
 - Kinto-Admin currently relies on standard redux patterns (sagas, containers, etc)
 - We don't spend _that_ much time writing new features

#### Cons
 - Higher barrier of entry for new contributors (most new devs will be familiar with hooks but not redux)
 - More complex state management flow
    - User interaction → Listener → Dispatch actions → Sagas → Actions → Reducers → Modify state → Rerender
 - More lines of code to do the same thing (85 vs 45 in example below)
 - More files to touch to do the same thing (2 vs 6 in example below)
 - Still relies on hooks to reduce dependency injection (useAppDispatch)
 - Another dependency

#### [Code example - redux](https://github.com/Kinto/kinto-admin/pull/3271/files)


### Option 2 - Migrate to hooks
If we were building kinto-admin today, nobody would pick Redux over hooks. A few custom hooks along with the standard redux hooks could manage our state with far fewer lines of code.

#### Pros
 - Less dependency injection compared to redux
    - If 5 components all need the same state, they can all use the same hook without passing properties around
 - Simplified state management flow
    - User interaction → Listener → [ Dispatch hook → Modify state → Rerender] 
 - Less "plumbing" code compared to redux (see example code)
 - One less dependency to maintain
 - Simplified testing 
    - Especially for any IO or async operations like API clients

#### Cons
 - The effort to convert all sagas to hooks
 - Some refactoring of parent components/pages
 - Relearning some best practices

#### [Code example - hooks](https://github.com/Kinto/kinto-admin/pull/3270/files)
