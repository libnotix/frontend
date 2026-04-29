
# NormalizedExamQuestionPayload


## Properties

Name | Type
------------ | -------------
`title` | string
`description` | string
`maxPoints` | number
`rubric` | string
`spec` | any
`correctAnswer` | any

## Example

```typescript
import type { NormalizedExamQuestionPayload } from ''

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "description": null,
  "maxPoints": null,
  "rubric": null,
  "spec": null,
  "correctAnswer": null,
} satisfies NormalizedExamQuestionPayload

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NormalizedExamQuestionPayload
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


