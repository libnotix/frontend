# DefaultApi

All URIs are relative to *http://localhost:3000*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**aiQueryPost**](DefaultApi.md#aiquerypost) | **POST** /ai/query | Free Gemini AI query |
| [**authLoginEndPost**](DefaultApi.md#authloginendpost) | **POST** /auth/login/end | Complete login process (verify OTP) |
| [**authLoginStartPost**](DefaultApi.md#authloginstartpost) | **POST** /auth/login/start | Start login process (request OTP) |
| [**authRefreshPost**](DefaultApi.md#authrefreshpost) | **POST** /auth/refresh | Refresh access token |
| [**authRegisterPost**](DefaultApi.md#authregisterpost) | **POST** /auth/register | Register a new user |
| [**authSessionGet**](DefaultApi.md#authsessionget) | **GET** /auth/session | Get current user session |
| [**classesGet**](DefaultApi.md#classesget) | **GET** /classes | List all school classes |
| [**classesIdDelete**](DefaultApi.md#classesiddelete) | **DELETE** /classes/{id} | Delete a school class |
| [**classesIdGet**](DefaultApi.md#classesidget) | **GET** /classes/{id} | Get a school class by ID |
| [**classesIdMembersGet**](DefaultApi.md#classesidmembersget) | **GET** /classes/{id}/members | List class members (teachers) |
| [**classesIdMembersPost**](DefaultApi.md#classesidmemberspostoperation) | **POST** /classes/{id}/members | Add a teacher to a class |
| [**classesIdMembersUserIdDelete**](DefaultApi.md#classesidmembersuseriddelete) | **DELETE** /classes/{id}/members/{userId} | Remove a teacher from a class |
| [**classesIdPut**](DefaultApi.md#classesidput) | **PUT** /classes/{id} | Update a school class |
| [**classesIdStudentsGet**](DefaultApi.md#classesidstudentsget) | **GET** /classes/{id}/students | List students in a class |
| [**classesIdStudentsPost**](DefaultApi.md#classesidstudentspost) | **POST** /classes/{id}/students | Add a student to a class |
| [**classesIdStudentsStudentIdDelete**](DefaultApi.md#classesidstudentsstudentiddelete) | **DELETE** /classes/{id}/students/{studentId} | Remove a student from a class |
| [**classesPost**](DefaultApi.md#classespost) | **POST** /classes | Create a school class |
| [**draftChatsIdGet**](DefaultApi.md#draftchatsidget) | **GET** /draft-chats/{id} | Get chat history for draft |
| [**draftChatsIdPost**](DefaultApi.md#draftchatsidpost) | **POST** /draft-chats/{id} | Send a message to the AI draft editor |
| [**draftLinkIdDelete**](DefaultApi.md#draftlinkiddelete) | **DELETE** /draft-link/{id} | Unlink a file from a draft |
| [**draftLinkIdGet**](DefaultApi.md#draftlinkidget) | **GET** /draft-link/{id} | Get files linked to a draft |
| [**draftLinkIdPost**](DefaultApi.md#draftlinkidpostoperation) | **POST** /draft-link/{id} | Link a file to a draft |
| [**draftsGet**](DefaultApi.md#draftsget) | **GET** /drafts | List all drafts for user |
| [**draftsIdDelete**](DefaultApi.md#draftsiddelete) | **DELETE** /drafts/{id} | Delete a draft |
| [**draftsIdGet**](DefaultApi.md#draftsidget) | **GET** /drafts/{id} | Get a specific draft |
| [**draftsIdPut**](DefaultApi.md#draftsidput) | **PUT** /drafts/{id} | Update a draft |
| [**draftsPost**](DefaultApi.md#draftspost) | **POST** /drafts | Create a draft |
| [**examChatsIdGet**](DefaultApi.md#examchatsidget) | **GET** /exam-chats/{id} | Get exam chat history |
| [**examChatsIdMessagesMessageIdPatch**](DefaultApi.md#examchatsidmessagesmessageidpatch) | **PATCH** /exam-chats/{id}/messages/{messageId} | Patch an AI exam edit message status |
| [**examChatsIdPost**](DefaultApi.md#examchatsidpostoperation) | **POST** /exam-chats/{id} | Exam AI chat (text reply JSON) |
| [**examLinkIdDelete**](DefaultApi.md#examlinkiddelete) | **DELETE** /exam-link/{id} | Unlink file |
| [**examLinkIdGet**](DefaultApi.md#examlinkidget) | **GET** /exam-link/{id} | List linked files |
| [**examLinkIdPost**](DefaultApi.md#examlinkidpostoperation) | **POST** /exam-link/{id} | Link file to exam |
| [**examsGet**](DefaultApi.md#examsget) | **GET** /exams | List my exams |
| [**examsIdAiEditsPost**](DefaultApi.md#examsidaieditspost) | **POST** /exams/{id}/ai-edits | Send a unified exam AI prompt and receive optional edit proposals |
| [**examsIdAttachDraftPost**](DefaultApi.md#examsidattachdraftpostoperation) | **POST** /exams/{id}/attach-draft | Materialize a draft as Markdown, upload, and link to exam for AI attachments |
| [**examsIdDelete**](DefaultApi.md#examsiddelete) | **DELETE** /exams/{id} | Delete exam |
| [**examsIdGet**](DefaultApi.md#examsidget) | **GET** /exams/{id} | Get exam with questions and linked files |
| [**examsIdPut**](DefaultApi.md#examsidputoperation) | **PUT** /exams/{id} | Update exam metadata |
| [**examsIdQuestionsPut**](DefaultApi.md#examsidquestionsputoperation) | **PUT** /exams/{id}/questions | Replace all questions (ordered); cannot remove questions if submissions exist |
| [**examsIdShareDelete**](DefaultApi.md#examsidsharedelete) | **DELETE** /exams/{id}/share | Disable share token |
| [**examsIdSharePost**](DefaultApi.md#examsidsharepost) | **POST** /exams/{id}/share | Enable share token for public read-only exam |
| [**examsIdSubmissionsGet**](DefaultApi.md#examsidsubmissionsget) | **GET** /exams/{id}/submissions | List submissions for exam |
| [**examsIdSubmissionsPost**](DefaultApi.md#examsidsubmissionspostoperation) | **POST** /exams/{id}/submissions | Create submission (manual or OCR stub) |
| [**examsPost**](DefaultApi.md#examspostoperation) | **POST** /exams | Create exam (dolgozat) |
| [**filesDownloadIdGet**](DefaultApi.md#filesdownloadidget) | **GET** /files/download/{id} | Download a file |
| [**filesGet**](DefaultApi.md#filesget) | **GET** /files | List all files for user |
| [**filesUploadPost**](DefaultApi.md#filesuploadpost) | **POST** /files/upload | Upload a file |
| [**healthGet**](DefaultApi.md#healthget) | **GET** /health | Health check |
| [**meClassesGet**](DefaultApi.md#meclassesget) | **GET** /me/classes | Get my classes (student) |
| [**publicExamsTokenGet**](DefaultApi.md#publicexamstokenget) | **GET** /public/exams/{token} | Public exam (no correctAnswer in questions) |
| [**rootGet**](DefaultApi.md#rootget) | **GET** / | Home page |
| [**studentsIdPut**](DefaultApi.md#studentsidput) | **PUT** /students/{id} | Update a student (rename) |
| [**subjectsGet**](DefaultApi.md#subjectsget) | **GET** /subjects | List all subjects |
| [**subjectsPost**](DefaultApi.md#subjectspost) | **POST** /subjects | Create a subject |
| [**submissionsIdAiReviewPost**](DefaultApi.md#submissionsidaireviewpost) | **POST** /submissions/{id}/ai-review | Run AI / deterministic review |
| [**submissionsIdDelete**](DefaultApi.md#submissionsiddelete) | **DELETE** /submissions/{id} | Delete submission |
| [**submissionsIdDigitizePost**](DefaultApi.md#submissionsiddigitizepost) | **POST** /submissions/{id}/digitize | OCR / extract answers from uploaded pages via AI |
| [**submissionsIdFinalizePost**](DefaultApi.md#submissionsidfinalizepost) | **POST** /submissions/{id}/finalize | Finalize grading (sum scores) |
| [**submissionsIdGet**](DefaultApi.md#submissionsidget) | **GET** /submissions/{id} | Get submission with answers and question definitions |
| [**submissionsIdPagesPost**](DefaultApi.md#submissionsidpagespost) | **POST** /submissions/{id}/pages | Upload scanned pages (multipart, field &#x60;file&#x60;) |
| [**submissionsIdPut**](DefaultApi.md#submissionsidputoperation) | **PUT** /submissions/{id} | Update answers and/or teacher scores |



## aiQueryPost

> AiQueryPost200Response aiQueryPost(freeQueryRequest)

Free Gemini AI query

Sends a free-form prompt to the Gemini model and returns the generated text response.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { AiQueryPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // FreeQueryRequest
    freeQueryRequest: ...,
  } satisfies AiQueryPostRequest;

  try {
    const data = await api.aiQueryPost(body);
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
| **freeQueryRequest** | [FreeQueryRequest](FreeQueryRequest.md) |  | |

### Return type

[**AiQueryPost200Response**](AiQueryPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | AI response generated successfully |  -  |
| **400** | Missing or invalid prompt |  -  |
| **500** | AI generation error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


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


## classesIdMembersGet

> ClassesIdMembersGet200Response classesIdMembersGet(id)

List class members (teachers)

Returns users who are members of this class. Class member or admin.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ClassesIdMembersGetRequest } from '';

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
  } satisfies ClassesIdMembersGetRequest;

  try {
    const data = await api.classesIdMembersGet(body);
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

[**ClassesIdMembersGet200Response**](ClassesIdMembersGet200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of members |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Class not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## classesIdMembersPost

> ClassesIdMembersPost201Response classesIdMembersPost(id, classesIdMembersPostRequest)

Add a teacher to a class

Adds a user as class member. Class member or admin.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ClassesIdMembersPostOperationRequest } from '';

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
    // ClassesIdMembersPostRequest
    classesIdMembersPostRequest: ...,
  } satisfies ClassesIdMembersPostOperationRequest;

  try {
    const data = await api.classesIdMembersPost(body);
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
| **classesIdMembersPostRequest** | [ClassesIdMembersPostRequest](ClassesIdMembersPostRequest.md) |  | |

### Return type

[**ClassesIdMembersPost201Response**](ClassesIdMembersPost201Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Member added |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Class or user not found |  -  |
| **409** | Already a member |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## classesIdMembersUserIdDelete

> ModelApiResponse classesIdMembersUserIdDelete(id, userId)

Remove a teacher from a class

Removes user from class members. Class member or admin.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ClassesIdMembersUserIdDeleteRequest } from '';

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
    // number
    userId: 56,
  } satisfies ClassesIdMembersUserIdDeleteRequest;

  try {
    const data = await api.classesIdMembersUserIdDelete(body);
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
| **userId** | `number` |  | [Defaults to `undefined`] |

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
| **200** | Member removed |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## classesIdPut

> ClassesPost201Response classesIdPut(id, updateClassRequest)

Update a school class

Updates a school class. User must be a class member or admin. 

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
| **403** | Forbidden — not a class member |  -  |
| **404** | School class not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## classesIdStudentsGet

> ClassesIdStudentsGet200Response classesIdStudentsGet(id)

List students in a class

Returns students enrolled in this class. Class member or admin.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ClassesIdStudentsGetRequest } from '';

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
  } satisfies ClassesIdStudentsGetRequest;

  try {
    const data = await api.classesIdStudentsGet(body);
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

[**ClassesIdStudentsGet200Response**](ClassesIdStudentsGet200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of students |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Class not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## classesIdStudentsPost

> ClassesIdStudentsPost201Response classesIdStudentsPost(id, createStudentRequest)

Add a student to a class

Creates a new student and enrolls them in the class. Class member or admin.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ClassesIdStudentsPostRequest } from '';

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
    // CreateStudentRequest
    createStudentRequest: ...,
  } satisfies ClassesIdStudentsPostRequest;

  try {
    const data = await api.classesIdStudentsPost(body);
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
| **createStudentRequest** | [CreateStudentRequest](CreateStudentRequest.md) |  | |

### Return type

[**ClassesIdStudentsPost201Response**](ClassesIdStudentsPost201Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Student created and enrolled |  -  |
| **400** | Invalid request body or validation error |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | School class not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## classesIdStudentsStudentIdDelete

> ModelApiResponse classesIdStudentsStudentIdDelete(id, studentId)

Remove a student from a class

Removes enrollment only; student record remains. Class member or admin.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ClassesIdStudentsStudentIdDeleteRequest } from '';

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
    // number
    studentId: 56,
  } satisfies ClassesIdStudentsStudentIdDeleteRequest;

  try {
    const data = await api.classesIdStudentsStudentIdDelete(body);
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
| **studentId** | `number` |  | [Defaults to `undefined`] |

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
| **200** | Enrollment removed |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## classesPost

> ClassesPost201Response classesPost(createClassRequest)

Create a school class

Creates a new school class. Any teacher or admin. Creator is added as class member.

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


## draftChatsIdGet

> draftChatsIdGet(id)

Get chat history for draft

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DraftChatsIdGetRequest } from '';

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
  } satisfies DraftChatsIdGetRequest;

  try {
    const data = await api.draftChatsIdGet(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Chat history |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## draftChatsIdPost

> DraftChatsIdPost200Response draftChatsIdPost(id, draftChatRequest, responseMode, xDraftChatResponseMode, idempotencyKey, xRequestId)

Send a message to the AI draft editor

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DraftChatsIdPostRequest } from '';

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
    // DraftChatRequest
    draftChatRequest: ...,
    // 'legacy' | 'grouped' | 'dual' | Controls payload shape during rollout. Defaults to `grouped`. (optional)
    responseMode: responseMode_example,
    // 'legacy' | 'grouped' | 'dual' | Header override for response payload mode. Defaults to grouped response. (optional)
    xDraftChatResponseMode: xDraftChatResponseMode_example,
    // string | Optional replay key. Same key and base revision produce the same changeSetId. (optional)
    idempotencyKey: idempotencyKey_example,
    // string | Optional request correlation id. (optional)
    xRequestId: xRequestId_example,
  } satisfies DraftChatsIdPostRequest;

  try {
    const data = await api.draftChatsIdPost(body);
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
| **draftChatRequest** | [DraftChatRequest](DraftChatRequest.md) |  | |
| **responseMode** | `legacy`, `grouped`, `dual` | Controls payload shape during rollout. Defaults to &#x60;grouped&#x60;. | [Optional] [Defaults to `undefined`] [Enum: legacy, grouped, dual] |
| **xDraftChatResponseMode** | `legacy`, `grouped`, `dual` | Header override for response payload mode. Defaults to grouped response. | [Optional] [Defaults to `undefined`] [Enum: legacy, grouped, dual] |
| **idempotencyKey** | `string` | Optional replay key. Same key and base revision produce the same changeSetId. | [Optional] [Defaults to `undefined`] |
| **xRequestId** | `string` | Optional request correlation id. | [Optional] [Defaults to `undefined`] |

### Return type

[**DraftChatsIdPost200Response**](DraftChatsIdPost200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | AI generated structured edits |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## draftLinkIdDelete

> draftLinkIdDelete(id, draftLinkIdPostRequest)

Unlink a file from a draft

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DraftLinkIdDeleteRequest } from '';

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
    // DraftLinkIdPostRequest
    draftLinkIdPostRequest: ...,
  } satisfies DraftLinkIdDeleteRequest;

  try {
    const data = await api.draftLinkIdDelete(body);
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
| **draftLinkIdPostRequest** | [DraftLinkIdPostRequest](DraftLinkIdPostRequest.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## draftLinkIdGet

> DraftLinkIdGet200Response draftLinkIdGet(id)

Get files linked to a draft

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DraftLinkIdGetRequest } from '';

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
  } satisfies DraftLinkIdGetRequest;

  try {
    const data = await api.draftLinkIdGet(body);
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

[**DraftLinkIdGet200Response**](DraftLinkIdGet200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## draftLinkIdPost

> draftLinkIdPost(id, draftLinkIdPostRequest)

Link a file to a draft

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DraftLinkIdPostOperationRequest } from '';

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
    // DraftLinkIdPostRequest
    draftLinkIdPostRequest: ...,
  } satisfies DraftLinkIdPostOperationRequest;

  try {
    const data = await api.draftLinkIdPost(body);
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
| **draftLinkIdPostRequest** | [DraftLinkIdPostRequest](DraftLinkIdPostRequest.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## draftsGet

> draftsGet()

List all drafts for user

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DraftsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.draftsGet();
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of drafts |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## draftsIdDelete

> draftsIdDelete(id)

Delete a draft

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DraftsIdDeleteRequest } from '';

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
  } satisfies DraftsIdDeleteRequest;

  try {
    const data = await api.draftsIdDelete(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Draft deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## draftsIdGet

> DraftsIdGet200Response draftsIdGet(id)

Get a specific draft

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DraftsIdGetRequest } from '';

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
  } satisfies DraftsIdGetRequest;

  try {
    const data = await api.draftsIdGet(body);
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

[**DraftsIdGet200Response**](DraftsIdGet200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Draft details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## draftsIdPut

> draftsIdPut(id, updateDraftRequest)

Update a draft

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DraftsIdPutRequest } from '';

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
    // UpdateDraftRequest
    updateDraftRequest: ...,
  } satisfies DraftsIdPutRequest;

  try {
    const data = await api.draftsIdPut(body);
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
| **updateDraftRequest** | [UpdateDraftRequest](UpdateDraftRequest.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Draft updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## draftsPost

> draftsPost(createDraftRequest)

Create a draft

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DraftsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // CreateDraftRequest
    createDraftRequest: ...,
  } satisfies DraftsPostRequest;

  try {
    const data = await api.draftsPost(body);
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
| **createDraftRequest** | [CreateDraftRequest](CreateDraftRequest.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Draft created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examChatsIdGet

> ExamChatsIdGet200Response examChatsIdGet(id)

Get exam chat history

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamChatsIdGetRequest } from '';

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
  } satisfies ExamChatsIdGetRequest;

  try {
    const data = await api.examChatsIdGet(body);
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

[**ExamChatsIdGet200Response**](ExamChatsIdGet200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examChatsIdMessagesMessageIdPatch

> ExamChatsIdMessagesMessageIdPatch200Response examChatsIdMessagesMessageIdPatch(id, messageId, examChatMessagePatchRequest)

Patch an AI exam edit message status

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamChatsIdMessagesMessageIdPatchRequest } from '';

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
    // string
    messageId: messageId_example,
    // ExamChatMessagePatchRequest
    examChatMessagePatchRequest: ...,
  } satisfies ExamChatsIdMessagesMessageIdPatchRequest;

  try {
    const data = await api.examChatsIdMessagesMessageIdPatch(body);
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
| **messageId** | `string` |  | [Defaults to `undefined`] |
| **examChatMessagePatchRequest** | [ExamChatMessagePatchRequest](ExamChatMessagePatchRequest.md) |  | |

### Return type

[**ExamChatsIdMessagesMessageIdPatch200Response**](ExamChatsIdMessagesMessageIdPatch200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Status updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examChatsIdPost

> ExamChatsIdPost200Response examChatsIdPost(id, examChatsIdPostRequest)

Exam AI chat (text reply JSON)

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamChatsIdPostOperationRequest } from '';

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
    // ExamChatsIdPostRequest (optional)
    examChatsIdPostRequest: ...,
  } satisfies ExamChatsIdPostOperationRequest;

  try {
    const data = await api.examChatsIdPost(body);
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
| **examChatsIdPostRequest** | [ExamChatsIdPostRequest](ExamChatsIdPostRequest.md) |  | [Optional] |

### Return type

[**ExamChatsIdPost200Response**](ExamChatsIdPost200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examLinkIdDelete

> examLinkIdDelete(id, examLinkIdPostRequest)

Unlink file

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamLinkIdDeleteRequest } from '';

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
    // ExamLinkIdPostRequest (optional)
    examLinkIdPostRequest: ...,
  } satisfies ExamLinkIdDeleteRequest;

  try {
    const data = await api.examLinkIdDelete(body);
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
| **examLinkIdPostRequest** | [ExamLinkIdPostRequest](ExamLinkIdPostRequest.md) |  | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examLinkIdGet

> examLinkIdGet(id)

List linked files

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamLinkIdGetRequest } from '';

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
  } satisfies ExamLinkIdGetRequest;

  try {
    const data = await api.examLinkIdGet(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examLinkIdPost

> examLinkIdPost(id, examLinkIdPostRequest)

Link file to exam

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamLinkIdPostOperationRequest } from '';

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
    // ExamLinkIdPostRequest (optional)
    examLinkIdPostRequest: ...,
  } satisfies ExamLinkIdPostOperationRequest;

  try {
    const data = await api.examLinkIdPost(body);
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
| **examLinkIdPostRequest** | [ExamLinkIdPostRequest](ExamLinkIdPostRequest.md) |  | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsGet

> examsGet()

List my exams

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.examsGet();
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsIdAiEditsPost

> ExamsIdAiEditsPost200Response examsIdAiEditsPost(id, examAiEditRequest, idempotencyKey, xRequestId)

Send a unified exam AI prompt and receive optional edit proposals

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsIdAiEditsPostRequest } from '';

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
    // ExamAiEditRequest
    examAiEditRequest: ...,
    // string (optional)
    idempotencyKey: idempotencyKey_example,
    // string (optional)
    xRequestId: xRequestId_example,
  } satisfies ExamsIdAiEditsPostRequest;

  try {
    const data = await api.examsIdAiEditsPost(body);
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
| **examAiEditRequest** | [ExamAiEditRequest](ExamAiEditRequest.md) |  | |
| **idempotencyKey** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xRequestId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**ExamsIdAiEditsPost200Response**](ExamsIdAiEditsPost200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | AI response with pending edit envelope |  -  |
| **413** | File context too large |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsIdAttachDraftPost

> ExamsIdAttachDraftPost200Response examsIdAttachDraftPost(id, examsIdAttachDraftPostRequest)

Materialize a draft as Markdown, upload, and link to exam for AI attachments

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsIdAttachDraftPostOperationRequest } from '';

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
    // ExamsIdAttachDraftPostRequest
    examsIdAttachDraftPostRequest: ...,
  } satisfies ExamsIdAttachDraftPostOperationRequest;

  try {
    const data = await api.examsIdAttachDraftPost(body);
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
| **examsIdAttachDraftPostRequest** | [ExamsIdAttachDraftPostRequest](ExamsIdAttachDraftPostRequest.md) |  | |

### Return type

[**ExamsIdAttachDraftPost200Response**](ExamsIdAttachDraftPost200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **404** | Draft or exam not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsIdDelete

> examsIdDelete(id)

Delete exam

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsIdDeleteRequest } from '';

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
  } satisfies ExamsIdDeleteRequest;

  try {
    const data = await api.examsIdDelete(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsIdGet

> examsIdGet(id)

Get exam with questions and linked files

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsIdGetRequest } from '';

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
  } satisfies ExamsIdGetRequest;

  try {
    const data = await api.examsIdGet(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsIdPut

> examsIdPut(id, examsIdPutRequest)

Update exam metadata

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsIdPutOperationRequest } from '';

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
    // ExamsIdPutRequest (optional)
    examsIdPutRequest: ...,
  } satisfies ExamsIdPutOperationRequest;

  try {
    const data = await api.examsIdPut(body);
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
| **examsIdPutRequest** | [ExamsIdPutRequest](ExamsIdPutRequest.md) |  | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsIdQuestionsPut

> examsIdQuestionsPut(id, examsIdQuestionsPutRequest)

Replace all questions (ordered); cannot remove questions if submissions exist

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsIdQuestionsPutOperationRequest } from '';

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
    // ExamsIdQuestionsPutRequest (optional)
    examsIdQuestionsPutRequest: ...,
  } satisfies ExamsIdQuestionsPutOperationRequest;

  try {
    const data = await api.examsIdQuestionsPut(body);
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
| **examsIdQuestionsPutRequest** | [ExamsIdQuestionsPutRequest](ExamsIdQuestionsPutRequest.md) |  | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **409** | Cannot remove questions when submissions exist |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsIdShareDelete

> examsIdShareDelete(id)

Disable share token

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsIdShareDeleteRequest } from '';

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
  } satisfies ExamsIdShareDeleteRequest;

  try {
    const data = await api.examsIdShareDelete(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsIdSharePost

> examsIdSharePost(id)

Enable share token for public read-only exam

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsIdSharePostRequest } from '';

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
  } satisfies ExamsIdSharePostRequest;

  try {
    const data = await api.examsIdSharePost(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsIdSubmissionsGet

> examsIdSubmissionsGet(id)

List submissions for exam

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsIdSubmissionsGetRequest } from '';

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
  } satisfies ExamsIdSubmissionsGetRequest;

  try {
    const data = await api.examsIdSubmissionsGet(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsIdSubmissionsPost

> examsIdSubmissionsPost(id, examsIdSubmissionsPostRequest)

Create submission (manual or OCR stub)

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsIdSubmissionsPostOperationRequest } from '';

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
    // ExamsIdSubmissionsPostRequest (optional)
    examsIdSubmissionsPostRequest: ...,
  } satisfies ExamsIdSubmissionsPostOperationRequest;

  try {
    const data = await api.examsIdSubmissionsPost(body);
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
| **examsIdSubmissionsPostRequest** | [ExamsIdSubmissionsPostRequest](ExamsIdSubmissionsPostRequest.md) |  | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## examsPost

> examsPost(examsPostRequest)

Create exam (dolgozat)

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ExamsPostOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // ExamsPostRequest (optional)
    examsPostRequest: ...,
  } satisfies ExamsPostOperationRequest;

  try {
    const data = await api.examsPost(body);
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
| **examsPostRequest** | [ExamsPostRequest](ExamsPostRequest.md) |  | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## filesDownloadIdGet

> filesDownloadIdGet(id)

Download a file

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { FilesDownloadIdGetRequest } from '';

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
  } satisfies FilesDownloadIdGetRequest;

  try {
    const data = await api.filesDownloadIdGet(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | File stream |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## filesGet

> filesGet()

List all files for user

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { FilesGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.filesGet();
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of files |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## filesUploadPost

> filesUploadPost(file)

Upload a file

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { FilesUploadPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // Blob (optional)
    file: BINARY_DATA_HERE,
  } satisfies FilesUploadPostRequest;

  try {
    const data = await api.filesUploadPost(body);
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
| **file** | `Blob` |  | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | File uploaded |  -  |

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


## meClassesGet

> ClassesGet200Response meClassesGet()

Get my classes (student)

For current user linked as a student; returns all classes they are enrolled in.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { MeClassesGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.meClassesGet();
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
| **200** | List of classes |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## publicExamsTokenGet

> publicExamsTokenGet(token)

Public exam (no correctAnswer in questions)

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { PublicExamsTokenGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string
    token: token_example,
  } satisfies PublicExamsTokenGetRequest;

  try {
    const data = await api.publicExamsTokenGet(body);
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
| **token** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

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


## studentsIdPut

> ClassesIdStudentsPost201Response studentsIdPut(id, updateStudentRequest)

Update a student (rename)

Update firstName, lastName, email. Class member of any class the student is in, or admin.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { StudentsIdPutRequest } from '';

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
    // UpdateStudentRequest (optional)
    updateStudentRequest: ...,
  } satisfies StudentsIdPutRequest;

  try {
    const data = await api.studentsIdPut(body);
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
| **updateStudentRequest** | [UpdateStudentRequest](UpdateStudentRequest.md) |  | [Optional] |

### Return type

[**ClassesIdStudentsPost201Response**](ClassesIdStudentsPost201Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Student updated |  -  |
| **400** | Validation error |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Student not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## subjectsGet

> SubjectsGet200Response subjectsGet()

List all subjects

Returns all subjects for filtering and class tagging. Any authenticated user.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { SubjectsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.subjectsGet();
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

[**SubjectsGet200Response**](SubjectsGet200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of subjects |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## subjectsPost

> SubjectsPost201Response subjectsPost(createSubjectRequest)

Create a subject

Creates a new subject (admin only). For filtering and data mining.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { SubjectsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // CreateSubjectRequest
    createSubjectRequest: ...,
  } satisfies SubjectsPostRequest;

  try {
    const data = await api.subjectsPost(body);
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
| **createSubjectRequest** | [CreateSubjectRequest](CreateSubjectRequest.md) |  | |

### Return type

[**SubjectsPost201Response**](SubjectsPost201Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Subject created |  -  |
| **400** | Validation error |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## submissionsIdAiReviewPost

> submissionsIdAiReviewPost(id)

Run AI / deterministic review

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { SubmissionsIdAiReviewPostRequest } from '';

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
  } satisfies SubmissionsIdAiReviewPostRequest;

  try {
    const data = await api.submissionsIdAiReviewPost(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## submissionsIdDelete

> submissionsIdDelete(id)

Delete submission

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { SubmissionsIdDeleteRequest } from '';

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
  } satisfies SubmissionsIdDeleteRequest;

  try {
    const data = await api.submissionsIdDelete(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## submissionsIdDigitizePost

> submissionsIdDigitizePost(id)

OCR / extract answers from uploaded pages via AI

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { SubmissionsIdDigitizePostRequest } from '';

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
  } satisfies SubmissionsIdDigitizePostRequest;

  try {
    const data = await api.submissionsIdDigitizePost(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## submissionsIdFinalizePost

> submissionsIdFinalizePost(id)

Finalize grading (sum scores)

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { SubmissionsIdFinalizePostRequest } from '';

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
  } satisfies SubmissionsIdFinalizePostRequest;

  try {
    const data = await api.submissionsIdFinalizePost(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## submissionsIdGet

> submissionsIdGet(id)

Get submission with answers and question definitions

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { SubmissionsIdGetRequest } from '';

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
  } satisfies SubmissionsIdGetRequest;

  try {
    const data = await api.submissionsIdGet(body);
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## submissionsIdPagesPost

> submissionsIdPagesPost(id, file)

Upload scanned pages (multipart, field &#x60;file&#x60;)

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { SubmissionsIdPagesPostRequest } from '';

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
    // Blob (optional)
    file: BINARY_DATA_HERE,
  } satisfies SubmissionsIdPagesPostRequest;

  try {
    const data = await api.submissionsIdPagesPost(body);
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
| **file** | `Blob` |  | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## submissionsIdPut

> submissionsIdPut(id, submissionsIdPutRequest)

Update answers and/or teacher scores

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { SubmissionsIdPutOperationRequest } from '';

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
    // SubmissionsIdPutRequest (optional)
    submissionsIdPutRequest: ...,
  } satisfies SubmissionsIdPutOperationRequest;

  try {
    const data = await api.submissionsIdPut(body);
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
| **submissionsIdPutRequest** | [SubmissionsIdPutRequest](SubmissionsIdPutRequest.md) |  | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

