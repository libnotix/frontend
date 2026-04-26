
# ExamsPostRequest


## Properties

Name | Type
------------ | -------------
`title` | string
`description` | string
`subjectId` | number
`schoolClassId` | number
`rubric` | string

## Example

```typescript
import type { ExamsPostRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "description": null,
  "subjectId": null,
  "schoolClassId": null,
  "rubric": null,
} satisfies ExamsPostRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExamsPostRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


