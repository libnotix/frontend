# DefaultApi

All URIs are relative to *http://localhost:3000*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**authLoginEndPost**](DefaultApi.md#authloginendpost) | **POST** /auth/login/end | Complete login process (verify OTP) |
| [**authLoginStartPost**](DefaultApi.md#authloginstartpost) | **POST** /auth/login/start | Start login process (request OTP) |
| [**authRefreshPost**](DefaultApi.md#authrefreshpost) | **POST** /auth/refresh | Refresh access token |
| [**authRegisterPost**](DefaultApi.md#authregisterpost) | **POST** /auth/register | Register a new user |
| [**authSessionGet**](DefaultApi.md#authsessionget) | **GET** /auth/session | Get current user session |
| [**classesGet**](DefaultApi.md#classesget) | **GET** /classes | List all school classes |
| [**classesIdDelete**](DefaultApi.md#classesiddelete) | **DELETE** /classes/{id} | Delete a school class |
| [**classesIdGet**](DefaultApi.md#classesidget) | **GET** /classes/{id} | Get a school class by ID |
| [**classesIdPut**](DefaultApi.md#classesidput) | **PUT** /classes/{id} | Update a school class |
| [**classesPost**](DefaultApi.md#classespost) | **POST** /classes | Create a school class |
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


## classesGet

> ClassesGet200Response classesGet()

List all school classes

Returns all school classes. Accessible by teachers and admins.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ClassesGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.classesGet();
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

[**ClassesGet200Response**](ClassesGet200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of school classes |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## classesIdDelete

> ModelApiResponse classesIdDelete(id)

Delete a school class

Deletes a school class. Only accessible by admins.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ClassesIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // number
    id: 56,
  } satisfies ClassesIdDeleteRequest;

  try {
    const data = await api.classesIdDelete(body);
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
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

[**ModelApiResponse**](ModelApiResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | School class deleted successfully |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden — only admins can delete classes |  -  |
| **404** | School class not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## classesIdGet

> ClassesPost201Response classesIdGet(id)

Get a school class by ID

Returns a single school class. Accessible by teachers and admins.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ClassesIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // number
    id: 56,
  } satisfies ClassesIdGetRequest;

  try {
    const data = await api.classesIdGet(body);
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
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

[**ClassesPost201Response**](ClassesPost201Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | School class found |  -  |
| **401** | Unauthorized |  -  |
| **404** | School class not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## classesIdPut

> ClassesPost201Response classesIdPut(id, updateClassRequest)

Update a school class

Updates a school class name. Teachers may only update classes they created. Admins may update any class. 

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ClassesIdPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // number
    id: 56,
    // UpdateClassRequest
    updateClassRequest: ...,
  } satisfies ClassesIdPutRequest;

  try {
    const data = await api.classesIdPut(body);
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
| **id** | `number` |  | [Defaults to `undefined`] |
| **updateClassRequest** | [UpdateClassRequest](UpdateClassRequest.md) |  | |

### Return type

[**ClassesPost201Response**](ClassesPost201Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | School class updated successfully |  -  |
| **400** | Invalid request body or validation error |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden — teacher tried to update another teacher\&#39;s class |  -  |
| **404** | School class not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## classesPost

> ClassesPost201Response classesPost(createClassRequest)

Create a school class

Creates a new school class. Accessible by teachers and admins.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ClassesPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // CreateClassRequest
    createClassRequest: ...,
  } satisfies ClassesPostRequest;

  try {
    const data = await api.classesPost(body);
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
| **createClassRequest** | [CreateClassRequest](CreateClassRequest.md) |  | |

### Return type

[**ClassesPost201Response**](ClassesPost201Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | School class created successfully |  -  |
| **400** | Invalid request body or validation error |  -  |
| **401** | Unauthorized |  -  |

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

