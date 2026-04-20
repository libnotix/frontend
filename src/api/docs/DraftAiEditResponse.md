
# DraftAiEditResponse


## Properties

Name | Type
------------ | -------------
`changeSetId` | string
`requestId` | string
`baseRevision` | string
`resultRevision` | string
`groups` | [Array&lt;AiDiffGroup&gt;](AiDiffGroup.md)
`operations` | [Array&lt;AiDiffOperation&gt;](AiDiffOperation.md)
`conflicts` | [Array&lt;AiConflictInfo&gt;](AiConflictInfo.md)
`checksum` | string
`messageToClient` | string

## Example

```typescript
import type { DraftAiEditResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "changeSetId": null,
  "requestId": null,
  "baseRevision": null,
  "resultRevision": null,
  "groups": null,
  "operations": null,
  "conflicts": null,
  "checksum": null,
  "messageToClient": null,
} satisfies DraftAiEditResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DraftAiEditResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


