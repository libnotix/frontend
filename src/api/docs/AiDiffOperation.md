
# AiDiffOperation


## Properties

Name | Type
------------ | -------------
`operationId` | string
`changeSetId` | string
`groupId` | string
`groupIndex` | number
`opIndex` | number
`action` | string
`target` | [AiDiffTarget](AiDiffTarget.md)
`oldContent` | Array&lt;{ [key: string]: any; }&gt;
`newContent` | Array&lt;{ [key: string]: any; }&gt;

## Example

```typescript
import type { AiDiffOperation } from ''

// TODO: Update the object below with actual values
const example = {
  "operationId": null,
  "changeSetId": null,
  "groupId": null,
  "groupIndex": null,
  "opIndex": null,
  "action": null,
  "target": null,
  "oldContent": null,
  "newContent": null,
} satisfies AiDiffOperation

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AiDiffOperation
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


