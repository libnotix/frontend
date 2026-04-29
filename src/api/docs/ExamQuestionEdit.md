
# ExamQuestionEdit


## Properties

Name | Type
------------ | -------------
`operationId` | string
`changeSetId` | string
`op` | string
`clientId` | string
`afterClientId` | string
`type` | [ExamQuestionType](ExamQuestionType.md)
`yaml` | string
`normalized` | [NormalizedExamQuestionPayload](NormalizedExamQuestionPayload.md)

## Example

```typescript
import type { ExamQuestionEdit } from ''

// TODO: Update the object below with actual values
const example = {
  "operationId": null,
  "changeSetId": null,
  "op": null,
  "clientId": null,
  "afterClientId": null,
  "type": null,
  "yaml": null,
  "normalized": null,
} satisfies ExamQuestionEdit

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExamQuestionEdit
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


