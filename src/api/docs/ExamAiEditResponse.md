
# ExamAiEditResponse


## Properties

Name | Type
------------ | -------------
`reply` | string
`hasEdits` | boolean
`changeSetId` | string
`requestId` | string
`baseRevision` | string
`resultRevision` | string
`edits` | [ExamAiEditsEnvelope](ExamAiEditsEnvelope.md)
`conflicts` | [Array&lt;ExamEditConflict&gt;](ExamEditConflict.md)
`checksum` | string

## Example

```typescript
import type { ExamAiEditResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "reply": null,
  "hasEdits": null,
  "changeSetId": null,
  "requestId": null,
  "baseRevision": null,
  "resultRevision": null,
  "edits": null,
  "conflicts": null,
  "checksum": null,
} satisfies ExamAiEditResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExamAiEditResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


