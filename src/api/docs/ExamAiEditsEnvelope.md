
# ExamAiEditsEnvelope


## Properties

Name | Type
------------ | -------------
`status` | string
`questionEdits` | [Array&lt;ExamQuestionEdit&gt;](ExamQuestionEdit.md)
`examMetaEdits` | [ExamMetaEdits](ExamMetaEdits.md)

## Example

```typescript
import type { ExamAiEditsEnvelope } from ''

// TODO: Update the object below with actual values
const example = {
  "status": null,
  "questionEdits": null,
  "examMetaEdits": null,
} satisfies ExamAiEditsEnvelope

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExamAiEditsEnvelope
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


