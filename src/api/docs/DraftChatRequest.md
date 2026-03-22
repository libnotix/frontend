
# DraftChatRequest


## Properties

Name | Type
------------ | -------------
`message` | string
`currentContext` | [DraftChatRequestCurrentContext](DraftChatRequestCurrentContext.md)
`editorOptions` | Array&lt;string&gt;
`baseRevision` | [DraftChatRequestBaseRevision](DraftChatRequestBaseRevision.md)
`responseMode` | string
`requestId` | string
`idempotencyKey` | string

## Example

```typescript
import type { DraftChatRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "message": null,
  "currentContext": null,
  "editorOptions": null,
  "baseRevision": null,
  "responseMode": null,
  "requestId": null,
  "idempotencyKey": null,
} satisfies DraftChatRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DraftChatRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


