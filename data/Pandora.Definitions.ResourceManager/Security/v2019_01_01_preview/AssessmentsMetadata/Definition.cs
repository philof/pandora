using System.Collections.Generic;
using Pandora.Definitions.Interfaces;


// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See NOTICE.txt in the project root for license information.


namespace Pandora.Definitions.ResourceManager.Security.v2019_01_01_preview.AssessmentsMetadata;

internal class Definition : ResourceDefinition
{
    public string Name => "AssessmentsMetadata";
    public IEnumerable<Interfaces.ApiOperation> Operations => new List<Interfaces.ApiOperation>
    {
        new AssessmentsMetadataGetOperation(),
        new AssessmentsMetadataListOperation(),
        new AssessmentsMetadataSubscriptionCreateOperation(),
        new AssessmentsMetadataSubscriptionDeleteOperation(),
        new AssessmentsMetadataSubscriptionGetOperation(),
        new AssessmentsMetadataSubscriptionListOperation(),
    };
    public IEnumerable<System.Type> Constants => new List<System.Type>
    {
        typeof(AssessmentTypeConstant),
        typeof(CategoriesConstant),
        typeof(ImplementationEffortConstant),
        typeof(SeverityConstant),
        typeof(ThreatsConstant),
        typeof(UserImpactConstant),
    };
    public IEnumerable<System.Type> Models => new List<System.Type>
    {
        typeof(SecurityAssessmentMetadataModel),
        typeof(SecurityAssessmentMetadataPropertiesModel),
    };
}