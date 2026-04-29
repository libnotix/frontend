
# ExamAiEditRequest


## Properties

Name | Type
------------ | -------------
`message` | string
`baseRevision` | [ExamAiEditRequestBaseRevision](ExamAiEditRequestBaseRevision.md)
`requestId` | string
`idempotencyKey` | string
`clientTabId` | string
`fileIds` | Array&lt;number&gt;
`attachmentMeta` | [Array&lt;ExamAttachmentMetaItem&gt;](ExamAttachmentMetaItem.md)
`clientQuestions` | [Array&lt;ExamClientQuestionRef&gt;](ExamClientQuestionRef.md)

## Example

```typescript
import type { ExamAiEditRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "message": null,
  "baseRevision": null,
  "requestId": null,
  "idempotencyKey": null,
  "clientTabId": null,
  "fileIds": null,
  "attachmentMeta": null,
  "clientQuestions": null,
} satisfies ExamAiEditRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExamAiEditRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


