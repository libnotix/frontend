
# ExamChatsIdPostRequest


## Properties

Name | Type
------------ | -------------
`message` | string
`fileIds` | Array&lt;number&gt;
`attachmentMeta` | [Array&lt;ExamAttachmentMetaItem&gt;](ExamAttachmentMetaItem.md)
`idempotencyKey` | string
`clientTabId` | string

## Example

```typescript
import type { ExamChatsIdPostRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "message": null,
  "fileIds": null,
  "attachmentMeta": null,
  "idempotencyKey": null,
  "clientTabId": null,
} satisfies ExamChatsIdPostRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExamChatsIdPostRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


