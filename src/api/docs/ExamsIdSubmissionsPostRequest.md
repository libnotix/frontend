
# ExamsIdSubmissionsPostRequest


## Properties

Name | Type
------------ | -------------
`digitizedFrom` | string
`studentId` | number
`answers` | [Array&lt;ExamsIdSubmissionsPostRequestAnswersInner&gt;](ExamsIdSubmissionsPostRequestAnswersInner.md)
`pageFileIds` | Array&lt;number&gt;
`runDigitize` | boolean

## Example

```typescript
import type { ExamsIdSubmissionsPostRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "digitizedFrom": null,
  "studentId": null,
  "answers": null,
  "pageFileIds": null,
  "runDigitize": null,
} satisfies ExamsIdSubmissionsPostRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExamsIdSubmissionsPostRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


