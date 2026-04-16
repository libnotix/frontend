# DefaultApi

All URIs are relative to *http://localhost:3000*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**authLoginEndPost**](DefaultApi.md#authloginendpost) | **POST** /auth/login/end | Complete login process (verify OTP) |
| [**authLoginStartPost**](DefaultApi.md#authloginstartpost) | **POST** /auth/login/start | Start login process (request OTP) |
| [**authRefreshPost**](DefaultApi.md#authrefreshpost) | **POST** /auth/refresh | Refresh access token |
| [**authRegisterPost**](DefaultApi.md#authregisterpost) | **POST** /auth/register | Register a new user |
| [**authSessionGet**](DefaultApi.md#authsessionget) | **GET** /auth/session | Get current user session |
| [**healthGet**](DefaultApi.md#healthget) | **GET** /health | Health check |
| [**rootGet**](DefaultApi.md#rootget) | **GET** / | Home page |



## authLoginEndPost

> AuthLoginEndPost200Response authLoginEndPost(loginEndRequest)

Complete login process (verify OTP)

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { AuthLoginEndPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // LoginEndRequest
    loginEndRequest: ...,
  } satisfies AuthLoginEndPostRequest;

  try {
    const data = await api.authLoginEndPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **loginEndRequest** | [LoginEndRequest](LoginEndRequest.md) |  | |

### Return type

[**AuthLoginEndPost200Response**](AuthLoginEndPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Login successful |  -  |
| **400** | Invalid request body |  -  |
| **401** | Invalid OTP |  -  |
| **500** | strict server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## authLoginStartPost

> AuthLoginStartPost200Response authLoginStartPost(loginStartRequest)

Start login process (request OTP)

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { AuthLoginStartPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // LoginStartRequest
    loginStartRequest: ...,
  } satisfies AuthLoginStartPostRequest;

  try {
    const data = await api.authLoginStartPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **loginStartRequest** | [LoginStartRequest](LoginStartRequest.md) |  | |

### Return type

[**AuthLoginStartPost200Response**](AuthLoginStartPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OTP sent successfully |  -  |
| **400** | Invalid request body |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## authRefreshPost

> AuthLoginEndPost200Response authRefreshPost(refreshRequest)

Refresh access token

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { AuthRefreshPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // RefreshRequest
    refreshRequest: ...,
  } satisfies AuthRefreshPostRequest;

  try {
    const data = await api.authRefreshPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **refreshRequest** | [RefreshRequest](RefreshRequest.md) |  | |

### Return type

[**AuthLoginEndPost200Response**](AuthLoginEndPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Token refreshed successfully |  -  |
| **400** | Invalid request body |  -  |
| **401** | Invalid token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## authRegisterPost

> ModelApiResponse authRegisterPost(registerRequest)

Register a new user

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { AuthRegisterPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // RegisterRequest
    registerRequest: ...,
  } satisfies AuthRegisterPostRequest;

  try {
    const data = await api.authRegisterPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **registerRequest** | [RegisterRequest](RegisterRequest.md) |  | |

### Return type

[**ModelApiResponse**](ModelApiResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | User created successfully |  -  |
| **400** | Invalid request body or validation error |  -  |
| **409** | User already exists |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## authSessionGet

> AuthSessionGet200Response authSessionGet()

Get current user session

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { AuthSessionGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.authSessionGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**AuthSessionGet200Response**](AuthSessionGet200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Session retrieved successfully |  -  |
| **401** | Invalid or missing token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## healthGet

> string healthGet()

Health check

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { HealthGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.healthGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## rootGet

> string rootGet()

Home page

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { RootGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.rootGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

