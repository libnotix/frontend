
# UpdateClassRequest


## Properties

Name | Type
------------ | -------------
`name` | string
`classNumber` | number
`subjectId` | number
`icon` | string
`color` | string

## Example

```typescript
import type { UpdateClassRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "classNumber": null,
  "subjectId": null,
  "icon": null,
  "color": null,
} satisfies UpdateClassRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateClassRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


