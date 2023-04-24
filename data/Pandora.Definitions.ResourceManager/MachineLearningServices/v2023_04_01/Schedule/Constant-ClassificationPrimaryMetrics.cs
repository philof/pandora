using Pandora.Definitions.Attributes;
using System.ComponentModel;

namespace Pandora.Definitions.ResourceManager.MachineLearningServices.v2023_04_01.Schedule;

[ConstantType(ConstantTypeAttribute.ConstantType.String)]
internal enum ClassificationPrimaryMetricsConstant
{
    [Description("AUCWeighted")]
    AUCWeighted,

    [Description("Accuracy")]
    Accuracy,

    [Description("AveragePrecisionScoreWeighted")]
    AveragePrecisionScoreWeighted,

    [Description("NormMacroRecall")]
    NormMacroRecall,

    [Description("PrecisionScoreWeighted")]
    PrecisionScoreWeighted,
}