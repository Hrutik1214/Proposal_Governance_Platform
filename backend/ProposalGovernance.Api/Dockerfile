# MULTI-STAGE DOCKERFILE FOR BACKEND API (.NET 10)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["ProposalGovernance.Api.csproj", "./"]
RUN dotnet restore "ProposalGovernance.Api.csproj"

# Copy source code and build
COPY . .
RUN dotnet publish "ProposalGovernance.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5031
EXPOSE 80

ENV ASPNETCORE_URLS=http://+:5031
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ProposalGovernance.Api.dll"]
