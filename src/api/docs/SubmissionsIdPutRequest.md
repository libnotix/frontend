
# SubmissionsIdPutRequest


## Properties

Name | Type
------------ | -------------
`answers` | [Array&lt;SubmissionsIdPutRequestAnswersInner&gt;](SubmissionsIdPutRequestAnswersInner.md)
`teacherScores` | [Array&lt;SubmissionsIdPutRequestTeacherScoresInner&gt;](SubmissionsIdPutRequestTeacherScoresInner.md)
`studentId` | number

## Example

```typescript
import type { SubmissionsIdPutRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "answers": null,
  "teacherScores": null,
  "studentId": null,
} satisfies SubmissionsIdPutRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SubmissionsIdPutRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


