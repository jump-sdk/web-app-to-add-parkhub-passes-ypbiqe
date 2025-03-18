#!/bin/bash

# Script to configure a custom domain for GitHub Pages hosting of the ParkHub Passes Creation Web Application

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set script directory and default configuration file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
DEFAULT_CONFIG_FILE="${SCRIPT_DIR}/../config/github-pages-config.json"

# GitHub Pages IP addresses
GITHUB_PAGES_IPS=("185.199.108.153" "185.199.109.153" "185.199.110.153" "185.199.111.153")

# Function to display usage information
function usage {
    echo "Configure a custom domain for GitHub Pages"
    echo
    echo "Usage: $0 [options] <domain-name>"
    echo
    echo "Options:"
    echo "  --repo <repository>      GitHub repository name (default: current git repository)"
    echo "  --user <username>        GitHub username or organization (default: extracted from git config)"
    echo "  --config <config_file>   Path to custom configuration file (default: ${DEFAULT_CONFIG_FILE})"
    echo "  --help                   Display this help message"
    echo
}

# Function to check if required dependencies are installed
function check_dependencies {
    local missing_deps=0

    echo -e "${BLUE}Checking dependencies...${NC}"

    # Check if git is installed
    if ! command -v git &> /dev/null; then
        echo -e "${RED}Error: git is not installed. Please install git.${NC}"
        missing_deps=1
    fi

    # Check if GitHub CLI (gh) is installed
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}Error: GitHub CLI (gh) is not installed. Please install gh: https://cli.github.com/manual/installation${NC}"
        missing_deps=1
    else
        # Check if gh is authenticated
        if ! gh auth status &> /dev/null; then
            echo -e "${RED}Error: GitHub CLI (gh) is not authenticated. Please run 'gh auth login'.${NC}"
            missing_deps=1
        fi
    fi

    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is not installed. Please install jq: https://stedolan.github.io/jq/download/${NC}"
        missing_deps=1
    fi

    # Check if dig is installed
    if ! command -v dig &> /dev/null; then
        echo -e "${RED}Error: dig is not installed. Please install dig (part of dnsutils or bind-utils package).${NC}"
        missing_deps=1
    fi

    if [ $missing_deps -eq 1 ]; then
        return 1
    fi

    echo -e "${GREEN}All dependencies are installed.${NC}"
    return 0
}

# Function to parse command line arguments
function parse_arguments {
    # Default values
    local domain_name=""
    local repo_name=""
    local github_username=""
    local config_file="${DEFAULT_CONFIG_FILE}"

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --repo)
                repo_name="$2"
                shift 2
                ;;
            --user)
                github_username="$2"
                shift 2
                ;;
            --config)
                config_file="$2"
                shift 2
                ;;
            --help)
                usage
                exit 0
                ;;
            -*)
                echo -e "${RED}Error: Unknown option $1${NC}" >&2
                usage
                return 2
                ;;
            *)
                if [ -z "$domain_name" ]; then
                    domain_name="$1"
                else
                    echo -e "${RED}Error: Unexpected argument $1${NC}" >&2
                    usage
                    return 2
                fi
                shift
                ;;
        esac
    done

    # If repo_name is not provided, try to extract it from git config
    if [ -z "$repo_name" ]; then
        # Try to extract repository name from git remote URL
        local git_remote=$(git config --get remote.origin.url 2>/dev/null)
        if [ -n "$git_remote" ]; then
            # Extract repo name from git URL (works for both HTTPS and SSH URLs)
            repo_name=$(basename -s .git "$git_remote" 2>/dev/null)
        fi
    fi

    # If github_username is not provided, try to extract it from git config
    if [ -z "$github_username" ]; then
        # Try to extract username from git remote URL
        local git_remote=$(git config --get remote.origin.url 2>/dev/null)
        if [ -n "$git_remote" ]; then
            if [[ $git_remote == *"github.com"* ]]; then
                # Extract username from HTTPS URL
                if [[ $git_remote == https* ]]; then
                    github_username=$(echo "$git_remote" | sed -E 's|https://github.com/([^/]+)/.*|\1|')
                # Extract username from SSH URL
                elif [[ $git_remote == git@* ]]; then
                    github_username=$(echo "$git_remote" | sed -E 's|git@github.com:([^/]+)/.*|\1|')
                fi
            fi
        fi
    fi

    # If domain name is not provided but config file exists, try to extract it from config
    if [ -z "$domain_name" ] && [ -f "$config_file" ]; then
        if command -v jq &> /dev/null; then
            if jq -e '.customDomain.name' "$config_file" &> /dev/null; then
                domain_name=$(jq -r '.customDomain.name' "$config_file")
                echo -e "${YELLOW}Domain name not provided, using value from config file: ${domain_name}${NC}"
            fi
        fi
    fi

    # If repo_name is not provided but config file exists, try to extract it from config
    if [ -z "$repo_name" ] && [ -f "$config_file" ]; then
        if command -v jq &> /dev/null; then
            if jq -e '.repository.name' "$config_file" &> /dev/null; then
                repo_name=$(jq -r '.repository.name' "$config_file")
                echo -e "${YELLOW}Repository name not provided, using value from config file: ${repo_name}${NC}"
            fi
        fi
    fi

    # If github_username is not provided but config file exists, try to extract it from config
    if [ -z "$github_username" ] && [ -f "$config_file" ]; then
        if command -v jq &> /dev/null; then
            if jq -e '.repository.owner' "$config_file" &> /dev/null; then
                github_username=$(jq -r '.repository.owner' "$config_file")
                echo -e "${YELLOW}GitHub username not provided, using value from config file: ${github_username}${NC}"
            fi
        fi
    fi

    # Validate required arguments
    if [ -z "$domain_name" ]; then
        echo -e "${RED}Error: Domain name is required.${NC}" >&2
        usage
        return 2
    fi

    if [ -z "$repo_name" ]; then
        echo -e "${RED}Error: Repository name could not be determined. Please specify with --repo.${NC}" >&2
        usage
        return 2
    fi

    if [ -z "$github_username" ]; then
        echo -e "${RED}Error: GitHub username could not be determined. Please specify with --user.${NC}" >&2
        usage
        return 2
    fi

    # Set global variables
    DOMAIN_NAME="$domain_name"
    REPO_NAME="$repo_name"
    GITHUB_USERNAME="$github_username"
    CONFIG_FILE="$config_file"

    echo -e "${BLUE}Configuration:${NC}"
    echo -e "  Domain Name: ${DOMAIN_NAME}"
    echo -e "  Repository: ${GITHUB_USERNAME}/${REPO_NAME}"
    echo -e "  Config File: ${CONFIG_FILE}"

    return 0
}

# Function to load configuration from the GitHub Pages config file
function load_configuration {
    # Check if configuration file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}Error: Configuration file not found: ${CONFIG_FILE}${NC}" >&2
        return 3
    fi

    echo -e "${BLUE}Loading configuration from ${CONFIG_FILE}...${NC}"

    # Check if the configuration file is valid JSON
    if ! jq -e . "$CONFIG_FILE" > /dev/null 2>&1; then
        echo -e "${RED}Error: Invalid JSON in configuration file: ${CONFIG_FILE}${NC}" >&2
        return 3
    fi

    # Extract custom domain settings
    if jq -e '.customDomain' "$CONFIG_FILE" > /dev/null 2>&1; then
        local custom_domain_enabled=$(jq -r '.customDomain.enabled' "$CONFIG_FILE")
        
        if [ "$custom_domain_enabled" != "true" ]; then
            echo -e "${RED}Error: Custom domain is not enabled in configuration file.${NC}" >&2
            return 3
        fi
        
        # Verify domain name matches configuration
        local config_domain_name=$(jq -r '.customDomain.name' "$CONFIG_FILE")
        if [ "$config_domain_name" != "$DOMAIN_NAME" ]; then
            echo -e "${YELLOW}Warning: Domain name in config file (${config_domain_name}) does not match provided domain name (${DOMAIN_NAME}).${NC}"
            echo -e "${YELLOW}Using provided domain name: ${DOMAIN_NAME}${NC}"
        fi
        
        # Set ENFORCE_HTTPS based on configuration
        ENFORCE_HTTPS=$(jq -r '.customDomain.enforceHttps' "$CONFIG_FILE")
        
        # Verify repository information
        local config_repo_name=$(jq -r '.repository.name' "$CONFIG_FILE")
        local config_repo_owner=$(jq -r '.repository.owner' "$CONFIG_FILE")
        
        if [ "$config_repo_name" != "$REPO_NAME" ]; then
            echo -e "${YELLOW}Warning: Repository name in config file (${config_repo_name}) does not match provided repository name (${REPO_NAME}).${NC}"
            echo -e "${YELLOW}Using provided repository name: ${REPO_NAME}${NC}"
        fi
        
        if [ "$config_repo_owner" != "$GITHUB_USERNAME" ]; then
            echo -e "${YELLOW}Warning: Repository owner in config file (${config_repo_owner}) does not match provided GitHub username (${GITHUB_USERNAME}).${NC}"
            echo -e "${YELLOW}Using provided GitHub username: ${GITHUB_USERNAME}${NC}"
        fi
    else
        echo -e "${RED}Error: Custom domain section not found in configuration file.${NC}" >&2
        return 3
    fi

    echo -e "${GREEN}Configuration loaded successfully.${NC}"
    return 0
}

# Function to verify access to the GitHub repository
function verify_repository_access {
    echo -e "${BLUE}Verifying repository access...${NC}"

    # Check if repository exists
    if ! gh repo view "${GITHUB_USERNAME}/${REPO_NAME}" --json name &> /dev/null; then
        echo -e "${RED}Error: Repository ${GITHUB_USERNAME}/${REPO_NAME} does not exist or you don't have access to it.${NC}" >&2
        return 4
    fi

    # Check if user has admin access to the repository (needed to configure GitHub Pages)
    local viewer_permission=$(gh repo view "${GITHUB_USERNAME}/${REPO_NAME}" --json viewerPermission --jq '.viewerPermission')
    
    if [ "$viewer_permission" != "ADMIN" ] && [ "$viewer_permission" != "WRITE" ]; then
        echo -e "${RED}Error: You need at least write access to repository ${GITHUB_USERNAME}/${REPO_NAME} to configure GitHub Pages.${NC}" >&2
        return 4
    fi

    echo -e "${GREEN}Repository access verified.${NC}"
    return 0
}

# Function to verify DNS configuration for the custom domain
function verify_dns_configuration {
    echo -e "${BLUE}Verifying DNS configuration for ${DOMAIN_NAME}...${NC}"
    
    local dns_configured=true
    
    # Determine if domain is an apex domain or subdomain
    local domain_parts=(${DOMAIN_NAME//./ })
    local domain_parts_count=${#domain_parts[@]}
    
    if [ $domain_parts_count -le 2 ]; then
        # Apex domain (example.com)
        echo -e "  Domain type: Apex domain"
        echo -e "  Required DNS configuration: A records pointing to GitHub Pages IPs"
        
        # Check A records
        for ip in "${GITHUB_PAGES_IPS[@]}"; do
            if dig +short A "$DOMAIN_NAME" | grep -q "^$ip$"; then
                echo -e "  ${GREEN}✓ A record for $DOMAIN_NAME points to $ip${NC}"
            else
                echo -e "  ${RED}✗ A record for $DOMAIN_NAME does not point to $ip${NC}"
                dns_configured=false
            fi
        done
    else
        # Subdomain (subdomain.example.com)
        echo -e "  Domain type: Subdomain"
        echo -e "  Required DNS configuration: CNAME record pointing to ${GITHUB_USERNAME}.github.io"
        
        # Check CNAME record
        local cname_record=$(dig +short CNAME "$DOMAIN_NAME")
        if [ "$cname_record" == "${GITHUB_USERNAME}.github.io." ] || [ "$cname_record" == "${GITHUB_USERNAME}.github.io" ]; then
            echo -e "  ${GREEN}✓ CNAME record for $DOMAIN_NAME points to ${GITHUB_USERNAME}.github.io${NC}"
        else
            echo -e "  ${RED}✗ CNAME record for $DOMAIN_NAME does not point to ${GITHUB_USERNAME}.github.io${NC}"
            echo -e "    Current CNAME value: ${cname_record:-None}"
            dns_configured=false
        fi
    fi
    
    if [ "$dns_configured" = false ]; then
        echo
        echo -e "${YELLOW}DNS configuration guide:${NC}"
        
        if [ $domain_parts_count -le 2 ]; then
            # Apex domain instructions
            echo -e "  For apex domain (${DOMAIN_NAME}), create the following A records:"
            for ip in "${GITHUB_PAGES_IPS[@]}"; do
                echo -e "    ${DOMAIN_NAME}.  A  $ip"
            done
        else
            # Subdomain instructions
            echo -e "  For subdomain (${DOMAIN_NAME}), create the following CNAME record:"
            echo -e "    ${DOMAIN_NAME}.  CNAME  ${GITHUB_USERNAME}.github.io"
        fi
        
        echo
        echo -e "${YELLOW}Note: DNS changes may take up to 24 hours to propagate.${NC}"
        echo -e "${YELLOW}You can continue with the setup, but the custom domain won't work until DNS is configured correctly.${NC}"
        
        # Ask user if they want to continue
        read -p "Continue anyway? (y/n): " continue_anyway
        if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
            echo -e "${RED}Aborting setup. Please fix DNS configuration and try again.${NC}" >&2
            return 5
        fi
    else
        echo -e "${GREEN}DNS configuration verified successfully.${NC}"
    fi
    
    return 0
}

# Function to create CNAME file in the gh-pages branch
function create_cname_file {
    echo -e "${BLUE}Creating CNAME file in gh-pages branch...${NC}"
    
    # Create temporary directory
    local temp_dir=$(mktemp -d)
    echo -e "  Using temporary directory: ${temp_dir}"
    
    # Check if gh-pages branch exists
    if ! gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/branches/gh-pages &> /dev/null; then
        echo -e "${YELLOW}Warning: gh-pages branch does not exist. It will be created when GitHub Pages is enabled.${NC}"
        echo -e "${YELLOW}Creating CNAME file in main branch instead...${NC}"
        
        # Clone repository
        echo -e "  Cloning repository..."
        if ! git clone https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git "${temp_dir}/repo" &> /dev/null; then
            echo -e "${RED}Error: Failed to clone repository.${NC}" >&2
            rm -rf "${temp_dir}"
            return 6
        fi
        
        # Navigate to repository directory
        cd "${temp_dir}/repo"
        
        # Create CNAME file
        echo -e "  Creating CNAME file with content: ${DOMAIN_NAME}"
        echo "${DOMAIN_NAME}" > CNAME
        
        # Commit and push changes
        echo -e "  Committing and pushing changes..."
        git add CNAME
        git commit -m "Add CNAME file for custom domain: ${DOMAIN_NAME}" &> /dev/null
        
        if ! git push origin HEAD &> /dev/null; then
            echo -e "${RED}Error: Failed to push changes.${NC}" >&2
            cd - > /dev/null
            rm -rf "${temp_dir}"
            return 6
        fi
        
        cd - > /dev/null
    else
        # Clone gh-pages branch
        echo -e "  Cloning gh-pages branch..."
        if ! git clone -b gh-pages https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git "${temp_dir}/repo" &> /dev/null; then
            echo -e "${RED}Error: Failed to clone gh-pages branch.${NC}" >&2
            rm -rf "${temp_dir}"
            return 6
        fi
        
        # Navigate to repository directory
        cd "${temp_dir}/repo"
        
        # Create CNAME file
        echo -e "  Creating CNAME file with content: ${DOMAIN_NAME}"
        echo "${DOMAIN_NAME}" > CNAME
        
        # Commit and push changes
        echo -e "  Committing and pushing changes..."
        git add CNAME
        git commit -m "Add CNAME file for custom domain: ${DOMAIN_NAME}" &> /dev/null
        
        if ! git push origin gh-pages &> /dev/null; then
            echo -e "${RED}Error: Failed to push changes.${NC}" >&2
            cd - > /dev/null
            rm -rf "${temp_dir}"
            return 6
        fi
        
        cd - > /dev/null
    fi
    
    # Clean up
    echo -e "  Cleaning up temporary directory..."
    rm -rf "${temp_dir}"
    
    echo -e "${GREEN}CNAME file created successfully.${NC}"
    return 0
}

# Function to configure GitHub Pages settings for custom domain
function configure_github_pages {
    echo -e "${BLUE}Configuring GitHub Pages settings...${NC}"
    
    # Check if GitHub Pages is already enabled
    local pages_info=$(gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/pages 2>/dev/null || echo '{"html_url": "Not configured"}')
    local current_url=$(echo "$pages_info" | jq -r '.html_url')
    
    if [ "$current_url" == "Not configured" ]; then
        echo -e "${YELLOW}Warning: GitHub Pages is not enabled for this repository.${NC}"
        echo -e "${YELLOW}Enabling GitHub Pages from gh-pages branch...${NC}"
        
        # Enable GitHub Pages from gh-pages branch
        if ! gh api --method POST repos/${GITHUB_USERNAME}/${REPO_NAME}/pages \
            -f source='{"branch":"gh-pages", "path":"/"}' &> /dev/null; then
            echo -e "${RED}Error: Failed to enable GitHub Pages.${NC}" >&2
            return 7
        fi
    fi
    
    # Set custom domain
    echo -e "  Setting custom domain to ${DOMAIN_NAME}..."
    if ! gh api --method PATCH repos/${GITHUB_USERNAME}/${REPO_NAME}/pages \
        -f cname="${DOMAIN_NAME}" &> /dev/null; then
        echo -e "${RED}Error: Failed to set custom domain.${NC}" >&2
        return 7
    fi
    
    # Enable HTTPS enforcement if specified
    if [ "$ENFORCE_HTTPS" == "true" ]; then
        echo -e "  Enabling HTTPS enforcement..."
        if ! gh api --method PATCH repos/${GITHUB_USERNAME}/${REPO_NAME}/pages \
            -f https_enforced=true &> /dev/null; then
            echo -e "${YELLOW}Warning: Failed to enable HTTPS enforcement. This may be because the domain is still being verified.${NC}"
            echo -e "${YELLOW}HTTPS enforcement will be retried during verification.${NC}"
        fi
    fi
    
    # Verify settings were applied
    local updated_pages_info=$(gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/pages 2>/dev/null || echo '{"html_url": "Not configured"}')
    local updated_domain=$(echo "$updated_pages_info" | jq -r '.cname // "Not set"')
    
    if [ "$updated_domain" != "$DOMAIN_NAME" ]; then
        echo -e "${RED}Error: Custom domain was not set correctly. Expected: ${DOMAIN_NAME}, Got: ${updated_domain}${NC}" >&2
        return 7
    fi
    
    echo -e "${GREEN}GitHub Pages settings configured successfully.${NC}"
    return 0
}

# Function to update GitHub Actions workflow configuration for custom domain
function update_workflow_configuration {
    echo -e "${BLUE}Updating GitHub Actions workflow configuration...${NC}"
    
    # Create temporary directory
    local temp_dir=$(mktemp -d)
    echo -e "  Using temporary directory: ${temp_dir}"
    
    # Clone repository
    echo -e "  Cloning repository..."
    if ! git clone https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git "${temp_dir}/repo" &> /dev/null; then
        echo -e "${RED}Error: Failed to clone repository.${NC}" >&2
        rm -rf "${temp_dir}"
        return 8
    fi
    
    # Navigate to repository directory
    cd "${temp_dir}/repo"
    
    # Check if workflow file exists
    local workflow_file=".github/workflows/deploy.yml"
    if [ ! -f "$workflow_file" ]; then
        echo -e "${YELLOW}Warning: Workflow file not found: ${workflow_file}${NC}"
        echo -e "${YELLOW}Skipping workflow configuration update.${NC}"
        cd - > /dev/null
        rm -rf "${temp_dir}"
        return 0
    fi
    
    echo -e "  Updating workflow file: ${workflow_file}"
    
    # Check if file contains CNAME step
    if ! grep -q "CNAME" "$workflow_file"; then
        # Find the deploy step and add CNAME step after it
        local deploy_line=$(grep -n "uses: JamesIves/github-pages-deploy-action" "$workflow_file" | cut -d ':' -f 1)
        
        if [ -n "$deploy_line" ]; then
            # Find the end of the step (next step or end of file)
            local next_step_line=$((deploy_line + 1))
            while [[ $next_step_line -le $(wc -l < "$workflow_file") ]]; do
                if [[ $(sed -n "${next_step_line}p" "$workflow_file") =~ ^[[:space:]]*-[[:space:]]*name: ]]; then
                    break
                fi
                next_step_line=$((next_step_line + 1))
            done
            
            # Insert CNAME step before the next step
            local temp_file="${temp_dir}/workflow_temp.yml"
            head -n $((next_step_line - 1)) "$workflow_file" > "$temp_file"
            echo "      - name: Create CNAME file" >> "$temp_file"
            echo "        run: echo \"${DOMAIN_NAME}\" > CNAME" >> "$temp_file"
            tail -n +$next_step_line "$workflow_file" >> "$temp_file"
            
            mv "$temp_file" "$workflow_file"
            echo -e "  ${GREEN}✓ Added CNAME creation step to workflow${NC}"
        else
            echo -e "${YELLOW}Warning: Could not find deploy step in workflow file.${NC}"
            echo -e "${YELLOW}Please add the following step manually:${NC}"
            echo
            echo "      - name: Create CNAME file"
            echo "        run: echo \"${DOMAIN_NAME}\" > CNAME"
            echo
        fi
    else
        # Update existing CNAME step
        sed -i "s|echo \".*\" > CNAME|echo \"${DOMAIN_NAME}\" > CNAME|g" "$workflow_file"
        echo -e "  ${GREEN}✓ Updated existing CNAME step in workflow${NC}"
    fi
    
    # Update production environment URL if present
    if grep -q "url:" "$workflow_file"; then
        sed -i "s|url: https://[^\"]*|url: https://${DOMAIN_NAME}|g" "$workflow_file"
        echo -e "  ${GREEN}✓ Updated production environment URL in workflow${NC}"
    fi
    
    # Commit and push changes
    echo -e "  Committing and pushing changes..."
    git add "$workflow_file"
    git commit -m "Update workflow for custom domain: ${DOMAIN_NAME}" &> /dev/null
    
    if ! git push origin HEAD &> /dev/null; then
        echo -e "${RED}Error: Failed to push changes.${NC}" >&2
        cd - > /dev/null
        rm -rf "${temp_dir}"
        return 8
    fi
    
    cd - > /dev/null
    rm -rf "${temp_dir}"
    
    echo -e "${GREEN}Workflow configuration updated successfully.${NC}"
    return 0
}

# Function to verify that custom domain is properly configured
function verify_custom_domain {
    echo -e "${BLUE}Verifying custom domain configuration...${NC}"
    
    # Wait a bit for GitHub Pages to process the changes
    echo -e "  Waiting for GitHub Pages to process changes..."
    sleep 5
    
    # Check if custom domain is set in GitHub Pages settings
    local pages_info=$(gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/pages 2>/dev/null || echo '{"html_url": "Not configured"}')
    local current_domain=$(echo "$pages_info" | jq -r '.cname // "Not set"')
    
    if [ "$current_domain" != "$DOMAIN_NAME" ]; then
        echo -e "${RED}Error: Custom domain is not set correctly in GitHub Pages settings.${NC}" >&2
        echo -e "${RED}Expected: ${DOMAIN_NAME}, Got: ${current_domain}${NC}" >&2
        return 9
    else
        echo -e "  ${GREEN}✓ Custom domain is set correctly in GitHub Pages settings${NC}"
    fi
    
    # Check if HTTPS is enforced (if requested)
    if [ "$ENFORCE_HTTPS" == "true" ]; then
        local https_enforced=$(echo "$pages_info" | jq -r '.https_enforced // false')
        
        if [ "$https_enforced" != "true" ]; then
            echo -e "${YELLOW}Warning: HTTPS enforcement is not enabled yet.${NC}"
            echo -e "${YELLOW}This may be because the domain is still being verified by GitHub.${NC}"
            echo -e "${YELLOW}HTTPS enforcement will be automatically enabled once the domain is verified.${NC}"
            echo -e "${YELLOW}You can check the status in the repository settings.${NC}"
            
            # Try to enable HTTPS enforcement again
            echo -e "  Retrying HTTPS enforcement..."
            if ! gh api --method PATCH repos/${GITHUB_USERNAME}/${REPO_NAME}/pages \
                -f https_enforced=true &> /dev/null; then
                echo -e "${YELLOW}Warning: Failed to enable HTTPS enforcement. Please check again later.${NC}"
            else
                echo -e "  ${GREEN}✓ HTTPS enforcement enabled${NC}"
            fi
        else
            echo -e "  ${GREEN}✓ HTTPS enforcement is enabled${NC}"
        fi
    fi
    
    # Check if CNAME file exists in gh-pages branch
    if gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/CNAME?ref=gh-pages &> /dev/null; then
        echo -e "  ${GREEN}✓ CNAME file exists in gh-pages branch${NC}"
    else
        echo -e "${YELLOW}Warning: CNAME file does not exist in gh-pages branch.${NC}"
        echo -e "${YELLOW}This may be because the branch is not yet created.${NC}"
        echo -e "${YELLOW}The CNAME file will be created automatically when GitHub Pages is deployed.${NC}"
    fi
    
    echo -e "${GREEN}Custom domain verification completed.${NC}"
    return 0
}

# Function to display a summary of the custom domain configuration
function display_configuration_summary {
    echo -e "${BLUE}Custom Domain Configuration Summary${NC}"
    echo -e "----------------------------------------"
    echo -e "Repository:       ${GITHUB_USERNAME}/${REPO_NAME}"
    echo -e "Custom Domain:    ${DOMAIN_NAME}"
    echo -e "HTTPS Enforced:   ${ENFORCE_HTTPS}"
    echo -e "GitHub Pages URL: https://${DOMAIN_NAME}"
    echo -e "----------------------------------------"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo -e "1. If you haven't already, configure DNS settings for your domain:"
    
    # Determine if domain is an apex domain or subdomain
    local domain_parts=(${DOMAIN_NAME//./ })
    local domain_parts_count=${#domain_parts[@]}
    
    if [ $domain_parts_count -le 2 ]; then
        # Apex domain instructions
        echo -e "   For apex domain (${DOMAIN_NAME}), create the following A records:"
        for ip in "${GITHUB_PAGES_IPS[@]}"; do
            echo -e "     ${DOMAIN_NAME}.  A  $ip"
        done
    else
        # Subdomain instructions
        echo -e "   For subdomain (${DOMAIN_NAME}), create the following CNAME record:"
        echo -e "     ${DOMAIN_NAME}.  CNAME  ${GITHUB_USERNAME}.github.io"
    fi
    
    echo -e "2. DNS changes may take up to 24 hours to propagate."
    echo -e "3. Check the GitHub Pages settings in your repository to see if the domain is verified."
    echo -e "4. After verification, https://${DOMAIN_NAME} will be available."
    
    if [ "$ENFORCE_HTTPS" == "true" ]; then
        echo -e "5. HTTPS will be enforced once the domain is verified."
    fi
}

# Main function
function main {
    # Display banner
    echo "==============================================================="
    echo "  ParkHub Passes Creation Web Application - Custom Domain Setup"
    echo "==============================================================="
    echo
    
    # Check dependencies
    check_dependencies
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    # Parse arguments
    parse_arguments "$@"
    if [ $? -ne 0 ]; then
        exit 2
    fi
    
    # Load configuration
    load_configuration
    if [ $? -ne 0 ]; then
        exit 3
    fi
    
    # Verify repository access
    verify_repository_access
    if [ $? -ne 0 ]; then
        exit 4
    fi
    
    # Verify DNS configuration
    verify_dns_configuration
    if [ $? -ne 0 ]; then
        exit 5
    fi
    
    # Create CNAME file
    create_cname_file
    if [ $? -ne 0 ]; then
        exit 6
    fi
    
    # Configure GitHub Pages
    configure_github_pages
    if [ $? -ne 0 ]; then
        exit 7
    fi
    
    # Update workflow configuration
    update_workflow_configuration
    if [ $? -ne 0 ]; then
        exit 8
    fi
    
    # Verify custom domain
    verify_custom_domain
    if [ $? -ne 0 ]; then
        exit 9
    fi
    
    # Display configuration summary
    display_configuration_summary
    
    echo
    echo -e "${GREEN}Custom domain configuration completed successfully!${NC}"
    echo -e "${GREEN}Your application will be available at https://${DOMAIN_NAME} once DNS propagation is complete.${NC}"
    
    return 0
}

# Execute main function with all arguments
main "$@"