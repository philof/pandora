using Pandora.Definitions.Attributes;
using System.ComponentModel;

namespace Pandora.Definitions.ResourceManager.Kusto.v2022_07_07.Clusters;

[ConstantType(ConstantTypeAttribute.ConstantType.String)]
internal enum LanguageExtensionNameConstant
{
    [Description("PYTHON")]
    PYTHON,

    [Description("R")]
    R,
}
