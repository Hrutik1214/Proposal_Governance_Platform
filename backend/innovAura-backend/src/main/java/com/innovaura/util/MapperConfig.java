package com.innovaura.util;

import org.mapstruct.ReportingPolicy;

@org.mapstruct.MapperConfig(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        typeConversionPolicy = ReportingPolicy.WARN
)
public interface MapperConfig {
}
