
# ExamQuestionInput


## Properties

Name | Type
------------ | -------------
`id` | number
`type` | [ExamQuestionType](ExamQuestionType.md)
`order` | number
`title` | string
`description` | string
`spec` | any
`correctAnswer` | any
`rubric` | string
`maxPoints` | number

## Example

```typescript
import type { ExamQuestionInput } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "type": null,
  "order": null,
  "title": null,
  "description": null,
  "spec": null,
  "correctAnswer": null,
  "rubric": null,
  "maxPoints": null,
} satisfies ExamQuestionInput

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExamQuestionInput
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


