import client from 'part:@sanity/base/client'
import {auditTime, take, share, filter, mergeMap, switchMapTo} from 'rxjs/operators'
import {defer, concat, throwError} from 'rxjs'

const fetch = (query, params) => defer(() => client.observable.fetch(query, params))
const listen = (query, params) =>
  defer(() =>
    client.listen(query, params, {
      events: ['welcome', 'mutation', 'reconnect'],
      includeResult: false
    })
  )

// todo: promote as building block for better re-use
// todo: optimize by removing deleted documents, etc.
export const listenQuery = (query, params) => {
  const fetchOnce$ = fetch(query, params)

  const events$ = listen(query, params).pipe(share())
  const mutations$ = events$.pipe(filter(ev => ev.type === 'mutation'))

  return concat(
    events$.pipe(
      mergeMap(
        first =>
          first.type === 'reconnect'
            ? // if the event source connection fails, the first event emitted will be a reconnect
              throwError(new Error('Could not establish EventSource connection.'))
            : fetchOnce$
      ),
      take(1)
    ),
    mutations$.pipe(
      auditTime(1000),
      switchMapTo(fetchOnce$)
    )
  )
}
