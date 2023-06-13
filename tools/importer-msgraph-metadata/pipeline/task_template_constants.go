package pipeline

import (
	"fmt"
	"os"
	"strings"
)

func (p pipelineTask) templateConstants(apiVersion string, models Models) error {
	seenEnums := make(map[string]uint8, 0)
	for _, model := range models {
		for _, field := range model.Fields {
			if _, seen := seenEnums[field.Title]; (field.Type == FieldTypeString || field.ItemType == FieldTypeString) && field.Enum != nil && !seen {
				seenEnums[field.Title] = 1

				valuesCode := make([]string, 0, len(field.Enum))
				for _, enumValue := range field.Enum {
					val := []string{
						fmt.Sprintf(`[Description("%s")]`, cleanName(fmt.Sprintf("%s", enumValue))),
						fmt.Sprintf(`@%s,`, enumValue),
					}
					valuesCode = append(valuesCode, strings.Join(val, "\n"))
				}

				code := fmt.Sprintf(`using Pandora.Definitions.Attributes;
using System.ComponentModel;

// Copyright (c) HashiCorp, Inc.
// SPDX-License-Identifier: MPL-2.0

namespace Pandora.Definitions.%[1]s.Models;

[ConstantType(ConstantTypeAttribute.ConstantType.String)]
internal enum %[2]sConstant
{
%[3]s
}
`, definitionsDirectory(apiVersion), field.Title, indentSpace(strings.Join(valuesCode, "\n\n"), 4))

				filename := fmt.Sprintf("Pandora.Definitions.%[2]s%[1]sModels%[1]sConstant-%[3]s.cs", string(os.PathSeparator), definitionsDirectory(apiVersion), field.Title)

				if err := p.files.addFile(filename, code); err != nil {
					return err
				}
			}
		}
	}

	return nil
}
