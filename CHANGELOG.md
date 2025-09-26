# Changelog

## 2.0.0

- [breaking change] New typing for request extension. In CreateRequestFn<E>, E is not assigned to the result. To pass it on to the next one, we now need to do it explicitly.
- [add] `request` as a separate function

## 1.6.1

- [fix] Automatic detection of response type json as text

## 1.6.0

- [add] `transform` option for transform the reply body
- [fix] `forwardOptions` were called twice

## 1.5.0

- [fix] `responseType` option bugs

## 1.4.3

- [fix] Invalid result with Empty array in searchParams

## 1.4.2

- [fix] SearchParams from url bug

## 1.4.1

- [fix] Content-length 0 header bug

## 1.4.0

- [add] `responseType` option

## 1.3.0

- [fix] Error handler `onError` with Fetch error

## 1.2.0

- [add] Custom error handler `onError`

...
