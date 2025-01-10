import { ReadonlyURLSearchParams, useRouter } from "next/navigation"

/**
 * Hook for managing URL query parameters with options to update the router.
 * @param {ReadonlyURLSearchParams} searchParams - Current search parameters from the URL.
 * @param {object} [options] - Configuration options.
 * @param {boolean} [options.shouldUseRouter=true] - Whether to update the router when query parameters change.
 * @param {boolean} [options.scroll=false] - Whether to scroll or not on routing.
 * @param {'replace' | 'push'} [options.method='replace'] - Method to use for router update.
 * @param {boolean} [options.deleteFalseValues=false] - Whether to delete the parameter if the parameter value is a false value.
 * @property {Function} setParams - Sets multiple query parameters at once.
 * @property {Function} appendParams - Appends values to existing query parameters or adds new ones.
 * @property {Function} deleteParams - Removes specified query parameters.
 * @property {Function} getParamValue - Retrieves the value of a specified query parameter.
 * @returns {object} - An object containing methods to set, append, get and delete query parameters.
 */
export const useSearchQueryParams = <
  T extends Record<string, string | number | (string | number)[] | null>
>(
  searchParams: ReadonlyURLSearchParams,
  options: {
    shouldUseRouter?: boolean
    method?: "replace" | "push"
    scroll?: boolean
    deleteFalseValues?: boolean
  } = {}
) => {
  const router = useRouter()

  /**
   * Sets multiple query parameters at once.
   * @param {Record<string, string | number | (string | number)[] | null>} params - Object containing parameter key-value pairs to set.
   * @param {object} [methodOptions] - Configuration options for this specific operation.
   * @returns {string} The new query string after setting the parameters.
   * @example
   *
   * // Set multiple query parameters
   * setParams({ foo: 'bar', baz: 123 });
   */

  const setParams = (
    params: Partial<T>,
    methodOptions: typeof options = options
  ) => {
    const {
      method = "push",
      scroll = false,
      shouldUseRouter = true,
      deleteFalseValues = true
    } = methodOptions

    const newSearchParams = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(params)) {
      if (
        value === null ||
        value === undefined ||
        (deleteFalseValues && !value)
      ) {
        newSearchParams.delete(key)
      } else if (Array.isArray(value)) {
        newSearchParams.delete(key) // Clear existing values for this key
        value.forEach(val => newSearchParams.append(key, String(val)))
      } else {
        newSearchParams.set(key, String(value))
      }
    }

    const newParamsString = newSearchParams.toString()
    if (shouldUseRouter && newParamsString !== searchParams.toString()) {
      if (method === "push") {
        router.push(`?${newParamsString}`, { scroll })
      } else {
        router.replace(`?${newParamsString}`, { scroll })
      }
    }
    return newParamsString
  }

  /**
   * Appends values to existing query parameters or adds new ones.
   * @param {Record<string, string | number | (string | number)[]>} params - Object containing parameter key-value pairs to append.
   * @param {object} [methodOptions] - Configuration options for this specific operation.
   * @returns {string} The new query string after appending the parameters.
   * @example
   *
   * // Append query parameters
   * appendParams({ foo: 'bar', baz: 123 });
   */

  const appendParams = (
    params: Partial<T>,
    methodOptions: typeof options = options
  ) => {
    const {
      method = "push",
      scroll = false,
      shouldUseRouter = true,
      deleteFalseValues = true
    } = methodOptions

    const newSearchParams = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(params)) {
      if (
        value === null ||
        value === undefined ||
        (deleteFalseValues && !value)
      ) {
        newSearchParams.delete(key)
      } else if (Array.isArray(value)) {
        value.forEach(val => newSearchParams.append(key, String(val)))
      } else {
        newSearchParams.append(key, String(value))
      }
    }

    const newParamsString = newSearchParams.toString()
    if (shouldUseRouter && newParamsString !== searchParams.toString()) {
      if (method === "push") {
        router.push(`?${newParamsString}`, { scroll })
      } else {
        router.replace(`?${newParamsString}`, { scroll })
      }
    }
    return newParamsString
  }
  /**
   * Removes specified query parameters.
   * @param {string | string[]} keys - The key or array of keys to remove from the query parameters.
   * @param {object} [methodOptions] - Configuration options for this specific operation.
   * @returns {string} The new query string after deleting the specified parameters.
   * @example
   *
   * // Delete a single query parameter
   * deleteParams('foo');
   *
   * // Delete multiple query parameters
   * deleteParams(['foo', 'baz']);
   */
  const deleteParams = (
    keys: keyof T | (keyof T)[],
    methodOptions: typeof options = options
  ) => {
    const {
      method = "push",
      scroll = false,
      shouldUseRouter = true
    } = methodOptions

    const newSearchParams = new URLSearchParams(searchParams)

    if (Array.isArray(keys)) {
      keys.forEach(key => newSearchParams.delete(String(key)))
    } else {
      newSearchParams.delete(String(keys))
    }

    const newParamsString = newSearchParams.toString()
    if (shouldUseRouter && newParamsString !== searchParams.toString()) {
      if (method === "push") {
        router.push(`?${newParamsString}`, { scroll })
      } else {
        router.replace(`?${newParamsString}`, { scroll })
      }
    }
    return newParamsString
  }

  /**
   * Retrieves the value of a specified query parameter.
   * @param {string} key - The key of the query parameter to retrieve.
   * @returns {string | null} The value of the specified query parameter, or null if not found.
   */

  const getParamValue = (key: keyof T): string | null => {
    return searchParams.get(String(key))
  }

  return { setParams, appendParams, deleteParams, getParamValue }
}
